CREATE OR REPLACE VIEW maintenance_with_cars AS
SELECT 
  m.maintenanceid,
  m.maintenancedate,
  m.maintenancetype,
  m.maintenancecost,
  c.carid,
  c.carmodel,
  c.carstatus
FROM maintenance m
JOIN cars c ON c.maintenanceid = m.maintenanceid;