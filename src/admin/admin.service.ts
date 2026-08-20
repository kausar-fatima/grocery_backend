import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { User } from '../users/users.entity';
import { Order } from '../orders/orders.entity';
import { Product } from '../products/products.entity';
import { Store } from '../stores/stores.entity';
import { Review } from '../reviews/review.entity';
import { UserRole } from '../common/enums/user_role.enum';
import { OrderStatus } from '../common/enums/order_status.enum';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(User) private users: Repository<User>,
        @InjectRepository(Order) private orders: Repository<Order>,
        @InjectRepository(Product) private products: Repository<Product>,
        @InjectRepository(Store) private stores: Repository<Store>,
        @InjectRepository(Review) private reviews: Repository<Review>,
        private notifications: NotificationsService,
    ) {}

    async stats() {
        const [
            totalUsers,
            customers,
            storeOwners,
            riders,
            pendingApprovals,
            totalProducts,
            totalStores,
            totalReviews,
        ] = await Promise.all([
            this.users.count(),
            this.users.count({ where: { role: UserRole.CUSTOMER } }),
            this.users.count({ where: { role: UserRole.STORE_OWNER } }),
            this.users.count({ where: { role: UserRole.RIDER } }),
            this.users.count({
                where: { role: UserRole.STORE_OWNER, isApproved: false },
            }),
            this.products.count(),
            this.stores.count(),
            this.reviews.count(),
        ]);

        const allOrders = await this.orders.find();
        const ordersByStatus: Record<string, number> = {};
        let revenue = 0;
        for (const o of allOrders) {
            ordersByStatus[o.status] = (ordersByStatus[o.status] ?? 0) + 1;
            if (o.status !== OrderStatus.CANCELLED) {
                revenue += Number(o.totalAmount);
            }
        }

        const recentOrders = await this.orders.find({
            relations: ['user'],
            order: { createdAt: 'DESC' },
            take: 8,
        });

        return {
            totalUsers,
            customers,
            storeOwners,
            riders,
            pendingApprovals,
            totalProducts,
            totalStores,
            totalReviews,
            totalOrders: allOrders.length,
            ordersByStatus,
            revenue: Number(revenue.toFixed(2)),
            recentOrders,
        };
    }

    listUsers(role?: string) {
        const where: Record<string, unknown> = { isSoftDeleted: false };
        if (role) where.role = role as UserRole;
        return this.users.find({ where, order: { createdAt: 'DESC' } });
    }

    async setApproval(id: number, approved: boolean) {
        const user = await this.users.findOne({ where: { id } });
        if (!user) throw new NotFoundException('User not found');
        user.isApproved = approved;
        await this.users.save(user);
        await this.notifications.create(user.id, {
            title: approved ? 'Account approved ✅' : 'Account access updated',
            body: approved
                ? 'Your partner account has been approved. You can now sign in.'
                : 'Your account approval has been revoked. Contact support for details.',
            type: 'approval',
        });
        return { message: 'Approval updated', isApproved: approved };
    }

    async setRole(id: number, role: UserRole) {
        const user = await this.users.findOne({ where: { id } });
        if (!user) throw new NotFoundException('User not found');
        user.role = role;
        await this.users.save(user);
        return { message: 'Role updated', role };
    }

    async removeUser(id: number) {
        const user = await this.users.findOne({ where: { id } });
        if (!user) throw new NotFoundException('User not found');
        user.isSoftDeleted = true;
        await this.users.save(user);
        return { message: 'User deleted' };
    }

    allOrders() {
        return this.orders.find({
            relations: ['user', 'items', 'items.product', 'payment', 'rider'],
            order: { createdAt: 'DESC' },
        });
    }

    allStores() {
        return this.stores.find({
            relations: ['owner'],
            order: { createdAt: 'DESC' },
        });
    }

    listRiders() {
        return this.users.find({
            where: { role: UserRole.RIDER, isSoftDeleted: false },
            order: { createdAt: 'DESC' },
        });
    }

    /** Non-admin users (for management lists). */
    listStaff() {
        return this.users.find({
            where: { role: Not(UserRole.ADMIN), isSoftDeleted: false },
            order: { createdAt: 'DESC' },
        });
    }
}
