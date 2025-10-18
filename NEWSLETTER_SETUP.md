# Newsletter Setup Guide (Buttondown)

This guide walks through setting up your bi-weekly newsletter using Buttondown and migrating from Formspree.

## Part 1: Buttondown Account Setup

### 1. Create Account
1. Go to [buttondown.email](https://buttondown.email)
2. Sign up for a free account (supports up to 100 subscribers)
3. Verify your email address

### 2. Configure Sender Settings
1. Navigate to Settings → Email
2. Set your **sender name**: "Miguel Tineo"
3. Set your **sender email**: Use your custom domain email (e.g., newsletter@miketineo.com) or your personal email
4. Configure **reply-to address**: miketineo@gmail.com

### 3. Customize Branding
1. Go to Settings → Appearance
2. Upload your logo/profile picture
3. Set brand colors to match your website theme
4. Customize footer with social links

### 4. Get Your API Key (Optional - for automation)
1. Go to Settings → Programming
2. Copy your API key (keep it secure)
3. Store it as a GitHub secret if using automation: `BUTTONDOWN_API_KEY`

## Part 2: Migrating Subscribers from Formspree

### Option A: Manual Export/Import (Recommended for Now)

1. **Export from Formspree:**
   - Log into your Formspree account
   - Go to your form: https://formspree.io/forms/mblzzwdv/integration
   - Navigate to "Submissions" tab
   - Click "Export as CSV"
   - Download the CSV file

2. **Import to Buttondown:**
   - In Buttondown, go to Subscribers → Import
   - Upload the CSV file
   - Map the email column to Buttondown's email field
   - Click "Import subscribers"

### Option B: Automated Sync (Future Enhancement)

You can automate this using n8n (you already have n8n for chat widget):

```
Formspree Webhook → n8n → Buttondown API
```

**n8n workflow:**
1. Trigger: Formspree webhook (configure in Formspree settings)
2. Action: HTTP Request to Buttondown API
   - Method: POST
   - URL: `https://api.buttondown.email/v1/subscribers`
   - Headers: `Authorization: Token YOUR_API_KEY`
   - Body: `{"email": "{{email}}"}`

## Part 3: Replace Newsletter Form

### Option A: Keep Formspree, Sync to Buttondown

Keep your existing form in `index.html` and `blog/index.html`:

```html
<form class="newsletter-form" action="https://formspree.io/f/mblzzwdv" method="POST">
    <input type="email" name="email" class="form-input newsletter-input"
           placeholder="your@email.com" required aria-label="Email address">
    <button type="submit" class="btn btn-primary newsletter-btn">Subscribe</button>
</form>
```

Then manually or automatically sync subscribers to Buttondown.

**Pros:**
- No code changes needed
- Formspree is already working
- You control the data

**Cons:**
- Need to manually export/import or setup automation
- Extra step in the workflow

### Option B: Switch to Buttondown Native Form (Recommended)

Replace Formspree form with Buttondown's embed form:

1. In Buttondown, go to Settings → Embedding
2. Copy the embed code
3. Replace the Formspree form in both:
   - `/index.html` (line 182)
   - `/blog/index.html` (line 79)

**Buttondown embed example:**
```html
<form
  action="https://buttondown.email/api/emails/embed-subscribe/YOUR_USERNAME"
  method="post"
  target="popupwindow"
  class="newsletter-form"
>
  <input type="email" name="email" class="form-input newsletter-input"
         placeholder="your@email.com" required aria-label="Email address">
  <button type="submit" class="btn btn-primary newsletter-btn">Subscribe</button>
</form>
```

**Pros:**
- Direct integration with Buttondown
- Automatic subscriber management
- No manual syncing needed
- Built-in double opt-in

**Cons:**
- Requires updating website code
- Need to migrate existing subscribers first

## Part 4: Newsletter Workflow

### Writing & Sending Process

1. **Write Blog Post in Markdown**
   - Create file in `blog/posts/YYYY-MM-DD-title.md`
   - Include frontmatter (title, date, excerpt, tags)
   - Write content in Markdown

2. **Test Locally**
   ```bash
   npm run build:blog
   # Open blog/index.html in browser to preview
   ```

3. **Deploy Blog Post**
   ```bash
   git add .
   git commit -m "Add new blog post: [title]"
   git push origin main
   # GitHub Actions will build and deploy automatically
   ```

4. **Send Newsletter via Buttondown**

   **Option 1: Manual (Recommended to Start)**
   - Log into Buttondown
   - Click "New email"
   - Copy your markdown content from the blog post
   - Paste into Buttondown (it supports Markdown!)
   - Preview the email
   - Send test to yourself
   - Schedule or send to all subscribers

   **Option 2: RSS-to-Email (Future Automation)**
   - Create RSS feed generator in build script
   - Configure Buttondown to monitor your RSS feed
   - Auto-send newsletter when new post detected

### Bi-Weekly Schedule

- **Week 1**: Write and edit blog post
- **Week 2**: Publish blog + send newsletter
- Repeat every 2 weeks

**Suggested Publishing Days:**
- Blog post goes live: Tuesday or Wednesday (mid-week gets better engagement)
- Newsletter sends: Same day as blog post, or 1 day later

## Part 5: Best Practices

### Email Subject Lines
- Keep under 50 characters
- Be specific and compelling
- Example: "Building Psychological Safety in Remote Teams"

### Email Content
- Start with a brief intro (2-3 sentences)
- Include the blog post content (Markdown formatted)
- End with a call-to-action:
  - Read on the website
  - Reply with thoughts
  - Share with colleagues

### Buttondown Features to Use
- **Scheduled sending**: Write ahead, schedule for later
- **Tags**: Segment your audience (e.g., "engineering", "leadership")
- **Analytics**: Track open rates and click-through rates
- **Archives**: All newsletters auto-archived on Buttondown

## Part 6: Legal Compliance (GDPR)

Buttondown is GDPR-compliant by default:
- ✅ Double opt-in available
- ✅ Easy unsubscribe (required by law)
- ✅ Privacy policy link in footer
- ✅ Data export/deletion on request

Make sure your website has:
- Privacy policy page (if you don't have one, add it)
- Clear statement on newsletter signup form about data usage

## Quick Start Checklist

- [ ] Create Buttondown account
- [ ] Configure sender settings and branding
- [ ] Export subscribers from Formspree
- [ ] Import subscribers to Buttondown
- [ ] Choose: Keep Formspree or switch to Buttondown form
- [ ] If switching: Update website forms
- [ ] Test newsletter workflow:
  - [ ] Write test blog post
  - [ ] Build blog locally
  - [ ] Send test email to yourself via Buttondown
- [ ] Schedule first newsletter send (based on sample blog post already created)

## Resources

- [Buttondown Documentation](https://docs.buttondown.email/)
- [Buttondown API Reference](https://api.buttondown.email/v1/schema)
- [Email Best Practices](https://www.buttondown.email/blog/email-best-practices)
- [GDPR Compliance Guide](https://gdpr.eu/email-marketing/)

## Need Help?

- Buttondown Support: support@buttondown.email
- Formspree Support: https://formspree.io/support
- Questions? Check the [Buttondown FAQ](https://buttondown.email/faq)
