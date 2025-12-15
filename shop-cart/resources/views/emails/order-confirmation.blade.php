<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>Order Confirmation</title>
</head>
<body>
    <h2>Thank you for your order!</h2>

<p>Order ID: <strong>#{{ $order->id }}</strong></p>

<table border="1" cellpadding="6" cellspacing="0">
    <thead>
        <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Subtotal</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($order->items as $item)
            <tr>
                <td>{{ $item->product->name }}</td>
                <td>{{ $item->quantity }}</td>
                <td>${{ number_format($item->price / 100, 2) }}</td>
                <td>${{ number_format(($item->price * $item->quantity) / 100, 2) }}</td>
            </tr>
        @endforeach
    </tbody>
</table>

<p><strong>Total:</strong> ${{ number_format($order->total / 100, 2) }}</p>

</body>
</html>
