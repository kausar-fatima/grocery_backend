import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './orders.entity';
import { OrderStatus } from '../common/enums/order_status.enum';

type Pt = { lat: number; lng: number };

/**
 * Simulates the rider driving from the store to the customer along a real road
 * route (fetched from the public OSRM server, with a straight-line fallback).
 *
 * This is the single source of truth for the rider's live position: it moves
 * `order.riderLat/riderLng` step-by-step along the route while the order is out
 * for delivery, so both the customer tracking screen and the rider app see the
 * rider move — without needing a real GPS device. The same route is exposed via
 * `getRoute()` so the map draws the exact path the rider follows.
 */
@Injectable()
export class DeliverySimulationService implements OnModuleInit {
    constructor(
        @InjectRepository(Order)
        private orders: Repository<Order>,
    ) {}

    private routes = new Map<number, Pt[]>();
    private timers = new Map<number, NodeJS.Timeout>();
    private idx = new Map<number, number>();

    /** Re-arm simulations for orders still out for delivery after a restart. */
    async onModuleInit() {
        const active = await this.orders.find({
            where: { status: OrderStatus.ON_THE_WAY },
        });
        for (const o of active) {
            this.start(o.id).catch(() => undefined);
        }
    }

    /** The road route (store → destination) for an order, cached per order. */
    async getRoute(orderId: number): Promise<Pt[]> {
        const cached = this.routes.get(orderId);
        if (cached) return cached;
        const order = await this.orders.findOne({ where: { id: orderId } });
        if (!order) return [];
        const s =
            order.storeLat != null && order.storeLng != null
                ? { lat: Number(order.storeLat), lng: Number(order.storeLng) }
                : null;
        const d =
            order.destLat != null && order.destLng != null
                ? { lat: Number(order.destLat), lng: Number(order.destLng) }
                : null;
        if (!s || !d) return [];
        const route = await this.buildRoute(s, d);
        this.routes.set(orderId, route);
        return route;
    }

    private async buildRoute(s: Pt, d: Pt): Promise<Pt[]> {
        try {
            const url =
                `https://router.project-osrm.org/route/v1/driving/` +
                `${s.lng},${s.lat};${d.lng},${d.lat}` +
                `?overview=full&geometries=geojson`;
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 6000);
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timeout);
            const json: any = await res.json();
            const coords = json?.routes?.[0]?.geometry?.coordinates;
            if (Array.isArray(coords) && coords.length >= 2) {
                // OSRM returns [lng, lat] pairs.
                return coords.map((c: number[]) => ({ lat: c[1], lng: c[0] }));
            }
        } catch {
            // fall through to straight line
        }
        return this.straightLine(s, d, 40);
    }

    private straightLine(s: Pt, d: Pt, n: number): Pt[] {
        const pts: Pt[] = [];
        for (let i = 0; i <= n; i++) {
            const t = i / n;
            pts.push({
                lat: s.lat + (d.lat - s.lat) * t,
                lng: s.lng + (d.lng - s.lng) * t,
            });
        }
        return pts;
    }

    /** Begin (or resume) advancing the rider along the route. */
    async start(orderId: number) {
        if (this.timers.has(orderId)) return;
        const route = await this.getRoute(orderId);
        if (route.length < 2) return;

        const order = await this.orders.findOne({ where: { id: orderId } });
        let start = 0;
        if (order?.riderLat != null && order?.riderLng != null) {
            start = this.nearest(
                route,
                Number(order.riderLat),
                Number(order.riderLng),
            );
        }
        this.idx.set(orderId, start);
        await this.setPos(orderId, route[start]);

        // ~40 ticks (×3s ≈ 2 min) to cover the whole route regardless of length.
        const step = Math.max(1, Math.round(route.length / 40));
        const timer = setInterval(() => {
            void this.tick(orderId, route, step);
        }, 3000);
        this.timers.set(orderId, timer);
    }

    private async tick(orderId: number, route: Pt[], step: number) {
        let i = (this.idx.get(orderId) ?? 0) + step;
        if (i >= route.length - 1) {
            i = route.length - 1;
            this.idx.set(orderId, i);
            await this.setPos(orderId, route[i]);
            this.stop(orderId); // arrived — hold at destination
            return;
        }
        this.idx.set(orderId, i);
        await this.setPos(orderId, route[i]);
    }

    private nearest(route: Pt[], lat: number, lng: number): number {
        let best = 0;
        let bestD = Infinity;
        for (let i = 0; i < route.length; i++) {
            const dl = route[i].lat - lat;
            const dn = route[i].lng - lng;
            const dd = dl * dl + dn * dn;
            if (dd < bestD) {
                bestD = dd;
                best = i;
            }
        }
        return best;
    }

    private async setPos(orderId: number, p: Pt) {
        await this.orders.update(orderId, {
            riderLat: p.lat,
            riderLng: p.lng,
        });
    }

    stop(orderId: number) {
        const timer = this.timers.get(orderId);
        if (timer) clearInterval(timer);
        this.timers.delete(orderId);
    }
}
