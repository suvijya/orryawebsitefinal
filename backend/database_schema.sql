-- Supabase SQL schema for Orrya Contact System
-- Run this in your Supabase SQL editor

-- Create contact_submissions table
CREATE TABLE contact_submissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(100),
    phone VARCHAR(20),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'archived')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_submitted_at ON contact_submissions(submitted_at DESC);
CREATE INDEX idx_contact_submissions_email ON contact_submissions(email);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_contact_submissions_updated_at
    BEFORE UPDATE ON contact_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public inserts (for contact form)
CREATE POLICY "Allow public contact form submissions" ON contact_submissions
    FOR INSERT WITH CHECK (true);

-- Create policy to allow authenticated reads (for admin)
-- Note: You'll need to set up authentication or use service role key for admin access
CREATE POLICY "Allow authenticated reads" ON contact_submissions
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Create policy to allow authenticated updates (for admin)
CREATE POLICY "Allow authenticated updates" ON contact_submissions
    FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Insert some sample data (optional - remove in production)
INSERT INTO contact_submissions (name, email, company, phone, message) VALUES 
('John Doe', 'john@example.com', 'Tech Corp', '+1-555-0123', 'Interested in your AI solutions for our healthcare platform.'),
('Jane Smith', 'jane@startup.io', 'StartupIO', NULL, 'Would like to discuss IoT integration for our smart building project.'),
('Mike Johnson', 'mike.johnson@enterprise.com', 'Enterprise Solutions', '+1-555-0456', 'Looking for system architecture consultation for our e-commerce platform.');

-- View to get submission statistics
CREATE VIEW submission_stats AS
SELECT 
    COUNT(*) as total_submissions,
    COUNT(*) FILTER (WHERE status = 'new') as new_submissions,
    COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_submissions,
    COUNT(*) FILTER (WHERE status = 'resolved') as resolved_submissions,
    COUNT(*) FILTER (WHERE status = 'archived') as archived_submissions,
    COUNT(*) FILTER (WHERE submitted_at >= NOW() - INTERVAL '7 days') as recent_submissions
FROM contact_submissions;
