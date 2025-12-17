<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>Daily Sales Report</title>
</head>
<body style="font-family: Arial, sans-serif;">
    <h2>Daily Sales Report - {{ $date }}</h2>

    <table cellpadding="8" cellspacing="0" border="1" style="border-collapse: collapse;">
        <thead>
            <tr>
                <th>Product</th>
                <th>Qty Sold</th>
                <th>Price</th>
                <th>Subtotal</th>
            </tr>
        </thead>
        <tbody>
        @foreach($rows as $row)
            <tr>
                <td>{{ $row['product'] }}</td>
                <td>{{ $row['quantity'] }}</td>
                <td>${{ number_format($row['price'] / 100, 2) }}</td>
                <td>${{ number_format($row['subtotal'] / 100, 2) }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>

    <p style="margin-top: 12px;">
        <strong>Total Revenue:</strong> ${{ number_format($totalRevenue / 100, 2) }}
    </p>
</body>
</html>
