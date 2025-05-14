-- Function to get unread notifications count
CREATE OR REPLACE FUNCTION get_unread_notifications_count(user_id UUID, user_type TEXT)
RETURNS INTEGER AS $$
DECLARE
  count_result INTEGER;
BEGIN
  IF user_type = 'farmer' THEN
    SELECT COUNT(*)
    INTO count_result
    FROM notifications n
    LEFT JOIN notification_views nv 
      ON n.id = nv.notification_id AND nv.farmer_id = user_id
    WHERE (n.recipient_type = 'farmers' OR n.recipient_type = 'both')
      AND (nv.id IS NULL OR nv.read = false);
  ELSIF user_type = 'lender' THEN
    SELECT COUNT(*)
    INTO count_result
    FROM notifications n
    LEFT JOIN notification_views nv 
      ON n.id = nv.notification_id AND nv.lender_id = user_id
    WHERE (n.recipient_type = 'lenders' OR n.recipient_type = 'both')
      AND (nv.id IS NULL OR nv.read = false);
  ELSE
    count_result := 0;
  END IF;
  
  RETURN count_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread notifications
CREATE OR REPLACE FUNCTION get_unread_notifications(user_id UUID, user_type TEXT)
RETURNS SETOF notifications AS $$
BEGIN
  IF user_type = 'farmer' THEN
    RETURN QUERY
    SELECT n.*
    FROM notifications n
    LEFT JOIN notification_views nv 
      ON n.id = nv.notification_id AND nv.farmer_id = user_id
    WHERE (n.recipient_type = 'farmers' OR n.recipient_type = 'both')
      AND (nv.id IS NULL OR nv.read = false)
    ORDER BY n.created_at DESC;
  ELSIF user_type = 'lender' THEN
    RETURN QUERY
    SELECT n.*
    FROM notifications n
    LEFT JOIN notification_views nv 
      ON n.id = nv.notification_id AND nv.lender_id = user_id
    WHERE (n.recipient_type = 'lenders' OR n.recipient_type = 'both')
      AND (nv.id IS NULL OR nv.read = false)
    ORDER BY n.created_at DESC;
  ELSE
    RETURN QUERY SELECT * FROM notifications WHERE 1=0; -- Empty result
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
