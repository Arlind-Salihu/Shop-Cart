<!doctype html>
<html>
  <body>
    <h2>Low Stock Alert</h2>

    <p>
      Product <strong>{{ $product->name }}</strong> is running low.
    </p>

    <ul>
      <li>Current stock: {{ $product->stock_quantity }}</li>
      <li>Price: ${{ number_format($product->price / 100, 2) }}</li>
      <li>Product ID: {{ $product->id }}</li>
    </ul>

    <p>— Shop Cart</p>
  </body>
</html>
