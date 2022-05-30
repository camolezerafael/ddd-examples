import Address from './domain/entity/address'
import Customer from './domain/entity/customer'
import OrderItem from './domain/entity/order_item'
import Order from './domain/entity/order'

let costumer = new Customer('123', 'Rafael Camoleze')
const address = new Address('Rua treze', 2, '21312-123', 'São Paulo')

costumer.Address = address
costumer.activate()

const item1 = new OrderItem('1', 'Item 1', 10, '123', 1)
const item2 = new OrderItem('2', 'Item 2', 15, '123', 1)

const order = new Order('1', '123', [item1, item2])