<h2>Daily Sales Report - {{ $date }}</h2>

@if ($rows->count() === 0)
  <p>No sales recorded today.</p>
@else
  <table border="1" cellpadding="8" cellspacing="0">
    <thead>
      <tr>
        <th>Product</th>
        <th>Total Sold</th>
        <th>Revenue</th>
      </tr>
    </thead>
    <tbody>
      @foreach ($rows as $row)
        <tr>
          <td>{{ $row->name }}</td>
          <td>{{ $row->total_qty }}</td>
          <td>${{ number_format($row->revenue / 100, 2) }}</td>
        </tr>
      @endforeach
    </tbody>
  </table>

  <p><strong>Total Revenue:</strong> ${{ number_format($totalRevenue / 100, 2) }}</p>
@endif
