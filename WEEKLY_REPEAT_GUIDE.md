# Weekly Repeat Feature Guide

## Overview
The schedule management system now supports **weekly recurring events**. This feature allows administrators to create events that automatically repeat every week until a specified end date.

## How to Use Weekly Repeat

### 1. Access Schedule Management
- Navigate to **Admin Dashboard** → **Manage Class Schedules**
- Or go directly to `/admin/schedules`

### 2. Create a Recurring Event
1. Click **"Add Schedule"** button
2. Fill in the basic event details:
   - **Event Title**: e.g., "Mathematics Class"
   - **Event Type**: Lesson, Exam, Assignment, etc.
   - **Description**: Optional details about the event
   - **Start Date & Time**: When the first occurrence starts
   - **End Date & Time**: When the first occurrence ends
   - **Location**: Room number, online platform, etc.
   - **Target Class**: Which class this event is for

### 3. Enable Weekly Repeat
1. In the **"Weekly Recurring Event"** section:
   - Toggle the **"Make this event repeat weekly"** switch to ON
   - Set the **"Repeat Until"** date (when the recurring series should end)

### 4. Save the Event
- Click **"Create Schedule"**
- The system will automatically generate individual events for each week

## Example Use Cases

### Regular Classes
- **Event**: "Mathematics Class"
- **Start**: Monday, 9:00 AM
- **End**: Monday, 10:30 AM
- **Repeat Until**: End of semester (e.g., December 15, 2024)
- **Result**: Creates a math class every Monday at 9 AM until December 15

### Weekly Exams
- **Event**: "Weekly Quiz"
- **Start**: Friday, 2:00 PM
- **End**: Friday, 3:00 PM
- **Repeat Until**: Last week of classes
- **Result**: Creates a quiz every Friday at 2 PM

### Study Sessions
- **Event**: "Study Group"
- **Start**: Wednesday, 4:00 PM
- **End**: Wednesday, 6:00 PM
- **Repeat Until**: Finals week
- **Result**: Creates study sessions every Wednesday

## Database Setup

### Run the Migration
Execute this SQL script in your Supabase SQL editor:

```sql
-- Add recurring fields to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS repeat_until DATE;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_events_recurring ON public.events(is_recurring, repeat_until);
```

## Features

### ✅ What's Included
- **Weekly repetition**: Events repeat every 7 days
- **Flexible end date**: Choose when the series stops
- **Visual indicators**: Recurring events show a repeat icon
- **Easy management**: Edit or delete individual occurrences
- **Calendar integration**: All recurring events appear in student/teacher calendars

### 🔄 How It Works
1. **Single Creation**: Create one event with repeat settings
2. **Automatic Generation**: System creates individual events for each week
3. **Individual Management**: Each occurrence can be edited or deleted separately
4. **Calendar Display**: All events appear in weekly/daily calendar views

### 📊 Table Display
- **Recurring Column**: Shows "Weekly" with repeat icon for recurring events
- **One-time Events**: Shows "One-time" for regular events
- **Easy Identification**: Green repeat icon for recurring events

## Best Practices

### ✅ Do's
- Set realistic end dates for recurring series
- Use descriptive titles for recurring events
- Consider class schedules when setting times
- Review generated events after creation

### ❌ Don'ts
- Don't create very long recurring series (more than 6 months)
- Don't forget to set an end date
- Don't create overlapping events for the same class
- Don't use vague titles for recurring events

## Troubleshooting

### Common Issues

**Q: My recurring events aren't showing up in the calendar?**
A: Make sure you've run the database migration script to add the recurring fields.

**Q: Can I edit a recurring event after creation?**
A: Yes, you can edit individual occurrences. Each week's event is stored separately.

**Q: How do I stop a recurring series early?**
A: Delete the individual events for the weeks you want to cancel, or edit the end date.

**Q: Can I change the time for future recurring events?**
A: You'll need to edit each future occurrence individually, or delete and recreate the series.

## Technical Details

### Database Schema
```sql
ALTER TABLE public.events 
ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN repeat_until DATE;
```

### Event Generation Logic
- Creates events every 7 days from start date
- Stops when reaching the repeat_until date
- Each event is stored as a separate record
- Maintains original event details (title, description, location)

### Performance Considerations
- Index on recurring fields for faster queries
- Events are generated upfront, not dynamically
- Calendar views load all events efficiently

## Support

If you encounter any issues with the weekly repeat feature:
1. Check that the database migration has been run
2. Verify your event dates are valid
3. Ensure you have proper permissions as an admin
4. Contact system administrator if problems persist
