export default function OrderStatusPage({ params }: { params: { orderId: string } }) {
  return <div>Status Order: {params.orderId}</div>
}
