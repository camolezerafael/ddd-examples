import {Sequelize} from 'sequelize-typescript'
import CustomerModel from '../db/sequelize/model/customer.model'
import OrderModel from '../db/sequelize/model/order.model'
import OrderItemModel from '../db/sequelize/model/order-item.model'
import ProductModel from '../db/sequelize/model/product.model'
import CustomerRepository from './customer.repository'
import Customer from '../../domain/entity/customer'
import Address from '../../domain/entity/address'
import ProductRepository from './product.repository'
import Product from '../../domain/entity/product'
import OrderItem from '../../domain/entity/order_item'
import Order from '../../domain/entity/order'
import OrderRepository from './order.repository'

describe('Order repository test', () => {
	
	let sequelize: Sequelize
	
	beforeEach(async() => {
		sequelize = new Sequelize({
			dialect: 'sqlite',
			storage: ':memory:',
			logging: false,
			sync   : {force: true}
		})
		
		sequelize.addModels([CustomerModel, OrderModel, OrderItemModel, ProductModel])
		await sequelize.sync()
		
	})
	
	afterEach(async() => {
		await sequelize.close()
	})
	
	
	it('should create a new order', async() => {
		const customerRepository = new CustomerRepository()
		const customer = new Customer('123', 'Customer 1')
		const address = new Address('Street 1', 1, 'Zipcode 1', 'City 1')
		customer.changeAddress(address)
		await customerRepository.create(customer)

		const productRepository = new ProductRepository()
		const product = new Product('1', 'Product 1', 10)
		await productRepository.create(product)

		const orderItem = new OrderItem('1', product.name, product.price, product.id, 2)

		const order = new Order('123', '123', [orderItem])
		
		const orderRepository = new OrderRepository()
		await orderRepository.create(order)

		const orderModel = await OrderModel.findOne({
			where  : {id: order.id},
			include: ['items']
		})

		expect(orderModel.toJSON()).toStrictEqual({
			id         : '123',
			customer_id: '123',
			total      : order.total(),
			items      : [
				{
					id        : orderItem.id,
					name      : orderItem.name,
					price     : orderItem.price,
					quantity  : orderItem.quantity,
					order_id  : '123',
					product_id: '1'
				}
			]
		})
		
	})
	
	it('should update a order', async() => {
		const customerRepository = new CustomerRepository()
		const customer = new Customer('123', 'Customer 1')
		const address = new Address('Street 1', 1, 'Zipcode 1', 'City 1')
		customer.changeAddress(address)
		await customerRepository.create(customer)

		const productRepository = new ProductRepository()
		const product = new Product('123', 'Product 1', 10)
		await productRepository.create(product)

		const orderItem = new OrderItem(
			'1',
			product.name,
			product.price,
			product.id,
			2
		)

		const order = new Order('123', '123', [orderItem])

		const orderRepository = new OrderRepository()
		await orderRepository.create(order)

		const product2 = new Product('321', 'Product 2', 20)
		await productRepository.create(product2)

		const orderItem2 = new OrderItem(
			'2',
			product2.name,
			product2.price,
			product2.id,
			3
		)

		order.changeItems([orderItem2])

		await orderRepository.update(order)

		const orderModel = await OrderModel.findOne({
			where  : {id: order.id},
			include: ['items']
		})

		expect(orderModel.toJSON()).toStrictEqual({
			id         : '123',
			customer_id: '123',
			total      : order.total(),
			items      : [
				{
					id        : orderItem2.id,
					name      : orderItem2.name,
					price     : orderItem2.price,
					quantity  : orderItem2.quantity,
					order_id  : '123',
					product_id: orderItem2.productId
				}
			]
		})
	})

	it('should find a order', async() => {
		const customerRepository = new CustomerRepository()
		const customer = new Customer('123', 'Customer 1')
		const address = new Address('Street 1', 1, 'Zipcode 1', 'City 1')
		customer.changeAddress(address)
		await customerRepository.create(customer)

		const productRepository = new ProductRepository()
		const product = new Product('123', 'Product 1', 30)
		await productRepository.create(product)

		const orderItem = new OrderItem(
			'1',
			product.name,
			product.price,
			product.id,
			2
		)

		const order = new Order('123', '123', [orderItem])
		const orderRepository = new OrderRepository()
		await orderRepository.create(order)

		const orderResult = await orderRepository.find(order.id)
		expect(order).toStrictEqual(orderResult)
	})

	it('should find all orders', async() => {
		const customerRepository = new CustomerRepository()
		const customer = new Customer('123', 'Customer 1')
		const address = new Address('Street 1', 1, 'Zipcode 1', 'City 1')
		customer.changeAddress(address)

		const customer2 = new Customer('321', 'Customer 2')
		const address2 = new Address('Street 2', 2, 'Zipcode 2', 'City 2')
		customer2.changeAddress(address2)

		await customerRepository.create(customer)
		await customerRepository.create(customer2)

		const productRepository = new ProductRepository()
		const product1 = new Product('123', 'Product 1', 50)
		const product2 = new Product('321', 'Product 2', 100)

		await productRepository.create(product1)
		await productRepository.create(product2)

		const orderItem1 = new OrderItem(
			'1',
			product1.name,
			product1.price,
			product1.id,
			5
		)

		const orderItem2 = new OrderItem(
			'2',
			product2.name,
			product2.price,
			product2.id,
			2
		)

		const order1 = new Order('123', '123', [orderItem1])
		const order2 = new Order('321', '321', [orderItem2])

		const orderRepository = new OrderRepository()
		await orderRepository.create(order1)
		await orderRepository.create(order2)

		const orderResult = await orderRepository.findAll()

		expect(orderResult).toHaveLength(2)
		expect(orderResult).toContainEqual(order1)
		expect(orderResult).toContainEqual(order2)
	})
	
})