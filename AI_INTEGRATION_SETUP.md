# AI Integration Setup Guide for Nordics

This guide will help you set up Thor the Bot with full access to your Supabase knowledgebase and wiki bucket.

## Prerequisites

- Supabase project with database access
- Supabase storage enabled
- Admin access to your Supabase dashboard

## Step 1: Set Up the Database

### 1.1 Create the AI Knowledgebase Table

Run the `ai_knowledgebase.sql` file in your Supabase SQL editor:

```sql
-- Copy and paste the entire contents of ai_knowledgebase.sql
```

This will:
- Create the `ai_knowledgebase` table
- Populate it with all the table descriptions and usage notes
- Set up proper indexing for performance

### 1.2 Set Up Permissions

Run the `supabase_permissions.sql` file in your Supabase SQL editor:

```sql
-- Copy and paste the entire contents of supabase_permissions.sql
```

This will:
- Enable RLS (Row Level Security) on the knowledgebase table
- Create policies for public read access
- Set up storage bucket permissions for the wiki
- Create search functions and indexes

## Step 2: Set Up Storage

### 2.1 Create AI Documents Bucket

The permissions script will automatically create the `ai-docs` bucket, but you can also create it manually:

1. Go to your Supabase Dashboard
2. Navigate to Storage
3. Create a new bucket called `ai-docs`
4. Set it to public

### 2.2 Upload AI Documents

You can upload documents to the ai-docs bucket:

1. In the Storage section, click on the `ai-docs` bucket
2. Click "Upload files"
3. Upload your markdown, text, or other document files
4. These will be automatically accessible to Thor the Bot

## Step 3: Verify the Integration

### 3.1 Test the Knowledgebase

1. Go to your admin panel (`/admin`)
2. Navigate to the "AI Knowledgebase Management" section
3. You should see the database entries loaded
4. Try adding a new entry to test the functionality

### 3.2 Test Thor the Bot

1. Open Thor the Bot (bottom left of your website)
2. Ask a question about Nordics, towns, nations, or achievements
3. Thor should now provide more detailed and accurate responses using the knowledgebase

## Step 4: Customize and Extend

### 4.1 Add More Knowledge

You can add more knowledgebase entries through the admin panel:

1. Go to Admin → AI Knowledgebase Management
2. Use the "Add New Entry" form
3. Fill in:
   - **Title**: A descriptive name
   - **Section**: Choose from "Supabase Table", "Storage", or "Instructions"
   - **Content**: Detailed description of what this is for
   - **Tags**: Comma-separated keywords for search

### 4.2 Upload AI Documents

Add more documents to the ai-docs bucket:

1. Create markdown or text files with guides, rules, or FAQs
2. Upload them to the `ai-docs` bucket in Supabase Storage
3. Thor will automatically search and use these when relevant

## Step 5: Monitor and Optimize

### 5.1 Check Performance

Monitor the AI responses and adjust:

- **Response quality**: If responses are too long/short, adjust the system prompt
- **Relevance**: If Thor isn't finding the right information, add more specific tags
- **Speed**: If responses are slow, consider caching frequently used knowledge

### 5.2 Update Knowledge

Regularly update the knowledgebase:

- Add new table descriptions as your database evolves
- Update wiki documents with new rules or guides
- Remove outdated information

## Troubleshooting

### Common Issues

1. **"Failed to get a response from Thor"**
   - Check your x.ai API key is valid
   - Verify the API key has access to `grok-3-mini`

2. **"Error fetching knowledgebase"**
   - Check Supabase permissions are set correctly
   - Verify the `ai_knowledgebase` table exists

3. **"Error listing AI documents"**
   - Check the `ai-docs` bucket exists in Supabase Storage
   - Verify storage permissions are set correctly

4. **Thor not using knowledgebase**
   - Check the `AIKnowledgeService` is imported correctly
   - Verify the knowledgebase table has data

### Debug Steps

1. Check browser console for errors
2. Verify Supabase connection in your app
3. Test the knowledgebase queries directly in Supabase SQL editor
4. Check storage bucket permissions

## Security Notes

- The knowledgebase table is publicly readable (needed for Thor)
- Only authenticated users can modify the knowledgebase
- Wiki bucket is publicly readable but only authenticated users can upload
- Sensitive information should not be stored in the knowledgebase

## Next Steps

Once this is working, you can:

1. **Add more sophisticated search** using embeddings
2. **Implement caching** for frequently accessed knowledge
3. **Add analytics** to see what questions Thor answers most
4. **Create a feedback system** to improve Thor's responses
5. **Add more data sources** like external APIs or databases

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all SQL scripts ran successfully
3. Check Supabase logs for errors
4. Test each component individually

The integration should now be fully functional with Thor the Bot having access to your complete knowledgebase and wiki documents! 