import OrderModel from '../db/sequelize/model/order.model'
import Order from '../../domain/entity/order'
import OrderItemModel from '../db/sequelize/model/order-item.model'
import OrderItem from '../../domain/entity/order_item'
import OrderRepositoryInterface from '../../domain/repository/order-repository.interface'

export default class OrderRepository implements OrderRepositoryInterface{
	
	async create(entity: Order): Promise<void> {
		await OrderModel.create(
			{
				id         : entity.id,
				customer_id: entity.customerId,
				total      : entity.total(),
				items      : entity.items.map((item) => ({
					id        : item.id,
					name      : item.name,
					price     : item.price,
					product_id: item.productId,
					quantity  : item.quantity
				}))
			},
			{
				include: [{model: OrderItemModel}]
			}
		)
	}
	
	async update(entity: Order): Promise<void> {

		const sequelize = OrderModel.sequelize

		await sequelize.transaction(async(ts) => {
			await OrderItemModel.destroy({
				where      : {
					order_id: entity.id
				},
				transaction: ts
			})

			const items = entity.items.map((item) => ({
					id        : item.id,
					name      : item.name,
					price     : item.price,
					product_id: item.productId,
					quantity  : item.quantity,
					order_id  : entity.id
				})
			)

			await OrderItemModel.bulkCreate(
				items,
				{
					transaction: ts
				}
			)

			await OrderModel.update(
				{
					total: entity.total()
				},
				{
					where      : {id: entity.id},
					transaction: ts
				}
			)


		})
	}

	async find(id: string): Promise<Order> {
		const orderModel = await OrderModel.findOne({
			where  : {
				id: id
			},
			include: ['items']
		})

		let items: OrderItem[] = []
		let orderItem

		orderModel.items.forEach((item) => {
			orderItem = new OrderItem(
				item.id,
				item.name,
				item.price / item.quantity,
				item.product_id,
				item.quantity
			)

			items.push(orderItem)
		})

		return new Order(orderModel.id, orderModel.customer_id, items)
	}

	async findAll(): Promise<Order[]> {
		const ordersList = await OrderModel.findAll({
			include: ['items']
		})

		let orders: Order[] = []
		let orderItems: OrderItem[] = []
		let orderItem

		ordersList.map((order) => {
			orderItems = []

			order.items.forEach((item) => {
				orderItem = new OrderItem(
					item.id,
					item.name,
					item.price / item.quantity,
					item.product_id,
					item.quantity
				)

				orderItems.push(orderItem)
			})

			orders.push(new Order(order.id, order.customer_id, orderItems))
		})

		return orders
	}

	
}