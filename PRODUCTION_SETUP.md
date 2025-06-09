# Production Setup Guide

## Environment Variables Setup

Create a `.env.local` file in your project root with the following variables:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your_production_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_production_publishable_key_here

# Product Configuration (Create these in Stripe Dashboard)
STRIPE_PRODUCT_ID=prod_your_production_product_id
STRIPE_PRICE_ID=price_your_production_price_id

# Pricing Configuration
PRODUCT_PRICE=20
PRODUCT_CURRENCY=USD
PRODUCT_NAME=Direct Connect Access

# App URLs (Your production domain)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Steps to Set Up Production

### 1. Stripe Dashboard Setup

1. **Switch to Live Mode** in your Stripe Dashboard
2. **Create a Product:**
   - Go to Products → Add Product
   - Name: "Direct Connect Access" (or your preferred name)
   - Copy the Product ID (starts with `prod_`)

3. **Create a Price:**
   - In your product, click "Add pricing"
   - Set price to $20.00 USD
   - Set to "One time" (not recurring)
   - Copy the Price ID (starts with `price_`)

4. **Get API Keys:**
   - Go to Developers → API Keys
   - Copy your **Publishable key** (starts with `pk_live_`)
   - Copy your **Secret key** (starts with `sk_live_`)

### 2. Environment Variables

Update your production environment with:

```bash
# Replace with your actual production values
STRIPE_SECRET_KEY=sk_live_your_actual_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_actual_publishable_key
STRIPE_PRODUCT_ID=prod_your_actual_product_id
STRIPE_PRICE_ID=price_your_actual_price_id
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 3. Webhook Setup (Recommended for Production)

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `payment_intent.succeeded`
4. Copy the webhook signing secret for verification

### 4. Testing in Production

1. Use test credit card: `4242 4242 4242 4242`
2. Any future expiry date
3. Any 3-digit CVC

## Configuration Options

### Change Price
To change the price displayed in the button, update:
```bash
PRODUCT_PRICE=25  # Changes button to "Checkout for $25"
```

### Change Currency
```bash
PRODUCT_CURRENCY=EUR
PRODUCT_PRICE=18
```
This will display as "Checkout for €18"

### Change Product Name
```bash
PRODUCT_NAME=Premium Connection Service
```

## Current Test Configuration

For reference, your current test setup uses:
- Product ID: `prod_SSntqeXSJJOTGA`
- Price ID: `price_1RXsHSDIiIX8ElFZLEMIkpnf`
- Price: $20 USD

## Security Notes

- Never commit `.env.local` to version control
- Use different Stripe accounts for test and production
- Regularly rotate API keys
- Enable Stripe's fraud detection in production
- Set up proper webhook validation

## Deployment Checklist

- [ ] Created production Stripe product
- [ ] Created production Stripe price
- [ ] Updated all environment variables
- [ ] Tested payment flow with test cards
- [ ] Set up webhooks (if needed)
- [ ] Updated success/cancel URLs
- [ ] Verified all environment variables are set correctly 