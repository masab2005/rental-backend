CREATE OR REPLACE VIEW active_rentals AS
SELECT 
  r.bookingid,
  r.customerid,
  r.carid,
  r.startdate,
  r.enddate,
  r.totalamount,
  r.status
FROM rentals r
WHERE r.status = 'active'
ORDER BY r.startdate;
