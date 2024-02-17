CREATE TABLE IF NOT EXISTS tools (
  tool_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL DEFAULT '',
  author VARCHAR(255) NOT NULL DEFAULT '',
  description TEXT DEFAULT NULL,
  input_params JSON NOT NULL DEFAULT '{}',
  output_result JSON NOT NULL DEFAULT '{}',
  tool_type VARCHAR(50) NOT NULL DEFAULT 'API' 
  CHECK(tool_type in ('API', 'DOM'))
);



# policies
CREATE POLICY "anno_read_tools" ON tools FOR
SELECT
  TO anon USING (TRUE);