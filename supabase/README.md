# Supabase Database Setup

These are the essential SQL scripts for setting up the database. Run them in order in the Supabase SQL Editor.

## 1. Schema Setup (1_schema.sql)
- Creates basic database structure
- Creates tables: profiles, classes, events, notifications
- Sets up indexes for better performance
- Run this first!

## 2. Security Setup (2_security.sql)
- Enables Row Level Security (RLS)
- Sets up access policies for each table
- Controls who can view/edit what data
- Run this second!

## 3. Test Data (3_test_data.sql)
- Adds sample data for testing
- OPTIONAL: Only use in development
- Replace 'auth-user-id-X' with real Supabase user IDs
- Run this last, and only if you need test data!

## How to Use

1. Go to Supabase Dashboard
2. Select your project
3. Go to SQL Editor
4. Copy and paste each script in order
5. Run them one by one
6. Check for any errors before proceeding to next script

## Important Notes

- Always backup your data before running scripts
- Test data script (3) needs real Supabase user IDs
- Make sure each script runs without errors
- Don't run test data script in production
