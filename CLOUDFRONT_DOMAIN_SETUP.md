# Adding Custom Domain to AWS CloudFront Distribution

This guide will help you add a custom domain (like `audio.yourname.com`) to your CloudFront distribution with an SSL certificate.

## Step 1: Find Your CloudFront Distribution

### Option A: AWS Console
1. Go to https://console.aws.amazon.com/cloudfront/
2. You'll see a list of all your CloudFront distributions
3. Find the one pointing to your S3 bucket
4. Note the **Distribution ID** (looks like `E1234567890ABC`)
5. Note the **Domain Name** (looks like `d1234567890abc.cloudfront.net`)

### Option B: Check Your S3 Bucket
1. Go to https://console.aws.amazon.com/s3/
2. Click on your bucket
3. Go to **Properties** tab
4. Scroll to **Static website hosting** or **CloudFront distributions**
5. You should see the distribution linked there

### Option C: Check Your Code/Config
- Look for any CloudFront URLs in your codebase
- Check environment variables or config files

## Step 2: Request SSL Certificate in AWS Certificate Manager

1. Go to https://console.aws.amazon.com/acm/
2. Make sure you're in the **US East (N. Virginia)** region (CloudFront requires certificates in this region)
3. Click **Request a certificate**
4. Choose **Request a public certificate**
5. Enter your domain:
   - For subdomain: `audio.yourname.com` (recommended for audio files)
   - For root domain: `yourname.com` (if you want to use root)
   - You can also add both: `audio.yourname.com` and `*.yourname.com` (wildcard)
6. Choose **DNS validation** (recommended)
7. Click **Request**

## Step 3: Validate the Certificate

1. After requesting, you'll see **Pending validation**
2. Click on the certificate
3. Expand the domain in the list
4. You'll see **CNAME name** and **CNAME value**
5. Go to your domain registrar (where you bought the domain)
6. Add a **CNAME record**:
   - **Name**: Copy the CNAME name (e.g., `_abc123def456.audio.yourname.com`)
   - **Value**: Copy the CNAME value (e.g., `_xyz789.abcdef.acm-validations.aws`)
7. Save the DNS record
8. Wait 5-30 minutes for validation
9. Refresh the ACM page - status should change to **Issued**

## Step 4: Add Domain to CloudFront Distribution

1. Go back to https://console.aws.amazon.com/cloudfront/
2. Click on your distribution ID
3. Go to the **General** tab
4. Click **Edit** next to **Alternate domain names (CNAMEs)**
5. Click **Add item**
6. Enter your domain: `audio.yourname.com`
7. Click **Save changes**

## Step 5: Attach SSL Certificate to CloudFront

1. Still in the **General** tab of your distribution
2. Click **Edit** next to **Custom SSL certificate**
3. Select your certificate from the dropdown (should show your domain)
4. If you don't see it, make sure:
   - Certificate is in **US East (N. Virginia)** region
   - Certificate status is **Issued**
5. Click **Save changes**

## Step 6: Configure DNS to Point to CloudFront

1. Go to your domain registrar (Namecheap, GoDaddy, etc.)
2. Add a **CNAME record**:
   - **Name**: `audio` (for `audio.yourname.com`) or `@` (for root domain)
   - **Value**: Your CloudFront domain name (e.g., `d1234567890abc.cloudfront.net`)
   - **TTL**: 3600 (or default)
3. Save the DNS record

## Step 7: Wait for Propagation

- DNS changes: 5 minutes to 48 hours (usually 5-30 minutes)
- CloudFront changes: 5-15 minutes to deploy globally
- Check status in CloudFront console - when it shows "Deployed", you're ready!

## Step 8: Update Your Code

Once your domain is working, update your environment variable:

```bash
# In .env.local or Vercel environment variables
VITE_S3_BASE_URL=https://audio.yourname.com
VITE_USE_S3=true
```

## Testing

1. Visit `https://audio.yourname.com/audio/halloween/01%20Halloween_1outof4.wav` in browser
2. Should load the audio file
3. Check that HTTPS (lock icon) is working

## Troubleshooting

**"Certificate not showing in CloudFront"**
- Make sure certificate is in **US East (N. Virginia)** region
- Certificate must be **Issued** status (not Pending)
- Wait a few minutes after certificate is issued

**"Distribution not updating"**
- CloudFront changes take 5-15 minutes to deploy
- Check status in CloudFront console
- Wait for "Deployed" status

**"DNS not resolving"**
- Wait 24-48 hours for full propagation
- Use https://dnschecker.org to check globally
- Verify CNAME record is correct at your registrar

**"SSL certificate error"**
- Make sure certificate is attached to the distribution
- Wait for CloudFront deployment to complete
- Clear browser cache and try again

## Quick Reference: Finding Distribution Info

**Distribution ID**: Found in CloudFront console list (e.g., `E1234567890ABC`)

**CloudFront Domain**: Found in distribution details, looks like:
- `d1234567890abc.cloudfront.net`

**Distribution ARN**: Found in distribution details, looks like:
- `arn:aws:cloudfront::123456789012:distribution/E1234567890ABC`

## Alternative: Use CloudFront Domain Directly

If you don't want to set up a custom domain, you can use the CloudFront domain directly:
- `https://d1234567890abc.cloudfront.net`

This works fine and doesn't require SSL certificate setup. Just use this URL in your `VITE_S3_BASE_URL` environment variable.
