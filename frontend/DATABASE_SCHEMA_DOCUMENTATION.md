# BIGBESTMART Database Schema Documentation

## Overview
This document provides a comprehensive analysis of the BIGBESTMART e-commerce platform database schema. The database is designed to support a full-featured e-commerce platform with advanced features including wallet systems, multi-vendor support, and comprehensive order management.

## Database Architecture

### Core Tables
The database consists of 50+ tables organized into logical groups:

1. **User Management** (4 tables)
2. **Product Management** (8 tables)
3. **Order Management** (6 tables)
4. **Wallet System** (8 tables)
5. **Content Management** (6 tables)
6. **Business Operations** (8 tables)
7. **Location & Logistics** (3 tables)
8. **Notifications & Communication** (4 tables)

---

## 1. User Management System

### `users` Table
**Primary user accounts table**
```sql
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  photo_url text,
  role text DEFAULT 'customer',
  created_at timestamp with time zone DEFAULT now(),
  last_login timestamp with time zone,
  is_active boolean DEFAULT true,
  phone text,
  avatar text,
  name text,
  account_type text,
  company_name text,
  -- Address fields
  street_address character varying,
  suite_unit_floor character varying,
  house_number character varying,
  locality character varying,
  area character varying,
  city character varying,
  state character varying,
  postal_code character varying,
  country character varying DEFAULT 'India',
  landmark character varying,
  gstin character varying CHECK (gstin IS NULL OR length(gstin::text) = 15),
  user_image text
);
```

### `business_users` Table
**Business account management**
```sql
CREATE TABLE public.business_users (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  first_name text,
  last_name text,
  phone_no text UNIQUE,
  email text UNIQUE,
  pan text UNIQUE,
  adhaar_no text UNIQUE,
  gstin text UNIQUE,
  password text,
  business_type text
);
```

### `user_addresses` Table
**User address management**
```sql
CREATE TABLE public.user_addresses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  address_name character varying NOT NULL,
  is_default boolean DEFAULT false,
  street_address character varying NOT NULL,
  suite_unit_floor character varying,
  house_number character varying,
  locality character varying,
  area character varying,
  city character varying NOT NULL,
  state character varying NOT NULL,
  postal_code character varying,
  country character varying NOT NULL,
  landmark text,
  longitude double precision,
  latitude double precision,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

### `bbm_dost` Table
**BBM Dost partner management**
```sql
CREATE TABLE public.bbm_dost (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone_no text NOT NULL,
  email text NOT NULL UNIQUE,
  pincode text,
  district text,
  state text,
  organization_name text,
  gst_no text,
  role text,
  reference_code text,
  reference_no text
);
```

---

## 2. Product Management System

### `products` Table
**Main products catalog**
```sql
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category_id uuid REFERENCES public.categories(id),
  price numeric NOT NULL,
  old_price numeric,
  rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  discount integer DEFAULT 0,
  image text,
  in_stock boolean DEFAULT true,
  popular boolean DEFAULT false,
  featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  category text,
  active boolean DEFAULT true,
  stock integer DEFAULT 0,
  subcategory_id uuid REFERENCES public.subcategories(id),
  group_id uuid REFERENCES public.groups(id),
  is_global boolean DEFAULT false,
  images ARRAY,
  video text,
  most_orders boolean,
  top_rating boolean,
  limited_product boolean,
  seasonal_product boolean,
  international_product boolean,
  top_sale boolean,
  uom text,
  is_last_section boolean,
  second_preview_image text,
  brand_name text,
  is_brand boolean,
  enquiry boolean
);
```

### `categories` Table
**Product categories**
```sql
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  featured boolean DEFAULT false,
  icon text,
  active boolean DEFAULT true
);
```

### `subcategories` Table
**Product subcategories**
```sql
CREATE TABLE public.subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  description text,
  icon character varying,
  image_url text,
  category_id uuid NOT NULL REFERENCES public.categories(id),
  featured boolean DEFAULT false,
  active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

### `groups` Table
**Product groups within subcategories**
```sql
CREATE TABLE public.groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  description text,
  icon character varying,
  image_url text,
  subcategory_id uuid NOT NULL REFERENCES public.subcategories(id),
  featured boolean DEFAULT false,
  active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

### `brand` Table
**Product brands**
```sql
CREATE TABLE public.brand (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text
);
```

### `product_brand` Table
**Many-to-many relationship between products and brands**
```sql
CREATE TABLE public.product_brand (
  product_id uuid NOT NULL REFERENCES public.products(id),
  brand_id uuid NOT NULL REFERENCES public.brand(id),
  PRIMARY KEY (product_id, brand_id)
);
```

### `warehouses` Table
**Warehouse management**
```sql
CREATE TABLE public.warehouses (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  name character varying,
  pincode character varying,
  latitude double precision,
  longitude double precision,
  address text
);
```

### `product_warehouse` Table
**Product-warehouse relationships**
```sql
CREATE TABLE public.product_warehouse (
  product_id uuid NOT NULL REFERENCES public.products(id),
  warehouse_id integer NOT NULL REFERENCES public.warehouses(id),
  PRIMARY KEY (product_id, warehouse_id)
);
```

---

## 3. Order Management System

### `orders` Table
**Main orders table**
```sql
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id),
  subtotal numeric NOT NULL,
  shipping numeric NOT NULL,
  total numeric NOT NULL,
  address text,
  payment_method text,
  status text DEFAULT 'Pending',
  adminnotes text,
  created_at timestamp without time zone DEFAULT now(),
  -- Detailed shipping address
  shipping_house_number text,
  shipping_street_address text,
  shipping_suite_unit_floor text,
  shipping_locality text,
  shipping_area text,
  shipping_city text,
  shipping_state text,
  shipping_postal_code text,
  shipping_country text DEFAULT 'India',
  shipping_landmark text,
  -- Payment details
  razorpay_order_id character varying,
  razorpay_payment_id character varying,
  razorpay_signature character varying,
  payment_id character varying,
  -- Tracking details
  tracking_number character varying,
  current_location character varying,
  estimated_delivery timestamp without time zone,
  -- GPS coordinates
  shipping_latitude numeric,
  shipping_longitude numeric,
  shipping_gps_address text,
  updated_at timestamp with time zone
);
```

### `order_items` Table
**Order line items**
```sql
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id),
  product_id uuid REFERENCES public.products(id),
  quantity integer NOT NULL,
  price numeric NOT NULL
);
```

### `order_tracking` Table
**Order tracking history**
```sql
CREATE TABLE public.order_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id),
  status character varying NOT NULL,
  location character varying,
  description text,
  timestamp timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
```

### `return_orders` Table
**Return order management**
```sql
CREATE TABLE public.return_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id),
  user_id uuid REFERENCES public.users(id),
  return_type character varying NOT NULL CHECK (return_type IN ('return', 'cancellation')),
  reason character varying NOT NULL,
  additional_details text,
  bank_account_holder_name character varying NOT NULL,
  bank_account_number character varying NOT NULL,
  bank_ifsc_code character varying NOT NULL,
  bank_name character varying NOT NULL,
  refund_amount numeric NOT NULL,
  status character varying DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processing', 'completed')),
  admin_notes text,
  admin_id uuid REFERENCES public.users(id),
  processed_at timestamp without time zone,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
```

### `return_order_items` Table
**Return order line items**
```sql
CREATE TABLE public.return_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  return_order_id uuid REFERENCES public.return_orders(id),
  order_item_id uuid REFERENCES public.order_items(id),
  quantity integer NOT NULL DEFAULT 1,
  return_reason character varying,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
```

### `refund_requests` Table
**Refund request management**
```sql
CREATE TABLE public.refund_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id),
  user_id uuid REFERENCES public.users(id),
  refund_amount numeric NOT NULL,
  refund_type character varying NOT NULL CHECK (refund_type IN ('order_cancellation', 'order_return', 'partial_refund')),
  payment_method character varying NOT NULL CHECK (payment_method IN ('prepaid', 'cod', 'wallet')),
  original_payment_id character varying,
  bank_account_holder_name character varying,
  bank_account_number character varying,
  bank_ifsc_code character varying,
  bank_name character varying,
  refund_mode character varying DEFAULT 'bank_transfer' CHECK (refund_mode IN ('bank_transfer', 'wallet', 'original_payment')),
  status character varying DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'rejected')),
  admin_notes text,
  processed_by uuid REFERENCES public.users(id),
  processed_at timestamp without time zone,
  razorpay_refund_id character varying,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. Wallet System

### `user_wallets` Table
**User wallet management**
```sql
CREATE TABLE public.user_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.users(id),
  balance numeric NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
  total_recharged numeric NOT NULL DEFAULT 0.00,
  total_spent numeric NOT NULL DEFAULT 0.00,
  status character varying DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'frozen')),
  is_frozen boolean DEFAULT false,
  frozen_reason text,
  frozen_by uuid REFERENCES public.users(id),
  frozen_at timestamp with time zone,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
```

### `wallet_transactions` Table
**Wallet transaction history**
```sql
CREATE TABLE public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES public.user_wallets(id),
  user_id uuid NOT NULL REFERENCES public.users(id),
  transaction_type_id integer NOT NULL REFERENCES public.transaction_types(id),
  amount numeric NOT NULL CHECK (amount > 0),
  balance_before numeric NOT NULL,
  balance_after numeric NOT NULL,
  reference_id character varying,
  reference_type character varying,
  description text,
  metadata jsonb,
  status character varying DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  created_by uuid REFERENCES public.users(id)
);
```

### `transaction_types` Table
**Transaction type definitions**
```sql
CREATE TABLE public.transaction_types (
  id integer PRIMARY KEY DEFAULT nextval('transaction_types_id_seq'),
  type_code character varying NOT NULL UNIQUE,
  type_name character varying NOT NULL,
  description text,
  is_credit boolean NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
```

### `wallet_recharge_requests` Table
**Wallet recharge requests**
```sql
CREATE TABLE public.wallet_recharge_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  wallet_id uuid NOT NULL REFERENCES public.user_wallets(id),
  amount numeric NOT NULL CHECK (amount > 0),
  payment_gateway character varying DEFAULT 'razorpay',
  gateway_order_id character varying,
  gateway_payment_id character varying,
  gateway_signature character varying,
  status character varying DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  failure_reason text,
  metadata jsonb,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  completed_at timestamp without time zone,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
```

### `wallet_refund_requests` Table
**Wallet refund requests**
```sql
CREATE TABLE public.wallet_refund_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  wallet_id uuid NOT NULL REFERENCES public.user_wallets(id),
  order_id uuid REFERENCES public.orders(id),
  amount numeric NOT NULL CHECK (amount > 0),
  reason character varying NOT NULL,
  description text,
  status character varying DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processed')),
  processed_by uuid REFERENCES public.users(id),
  processed_at timestamp without time zone,
  admin_notes text,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
```

### `admin_wallets` Table
**Admin wallet management**
```sql
CREATE TABLE public.admin_wallets (
  id integer PRIMARY KEY DEFAULT nextval('admin_wallets_id_seq'),
  admin_id uuid NOT NULL REFERENCES auth.users(id),
  balance numeric NOT NULL DEFAULT 0.00,
  is_frozen boolean DEFAULT false,
  frozen_reason text,
  frozen_by uuid REFERENCES auth.users(id),
  frozen_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

### `admin_wallet_transactions` Table
**Admin wallet transactions**
```sql
CREATE TABLE public.admin_wallet_transactions (
  id integer PRIMARY KEY DEFAULT nextval('admin_wallet_transactions_id_seq'),
  admin_id uuid NOT NULL REFERENCES auth.users(id),
  transaction_type character varying NOT NULL,
  amount numeric DEFAULT 0.00,
  balance_before numeric NOT NULL,
  balance_after numeric NOT NULL,
  description text,
  reference_type character varying,
  reference_id character varying,
  status character varying DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now()
);
```

### `admin_wallet_recharge_requests` Table
**Admin wallet recharge requests**
```sql
CREATE TABLE public.admin_wallet_recharge_requests (
  id integer PRIMARY KEY DEFAULT nextval('admin_wallet_recharge_requests_id_seq'),
  admin_id uuid NOT NULL REFERENCES auth.users(id),
  amount numeric NOT NULL,
  status character varying DEFAULT 'pending',
  razorpay_order_id character varying,
  razorpay_payment_id character varying,
  razorpay_signature character varying,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

### `promotion_wallets` Table
**Promotional wallet credits**
```sql
CREATE TABLE public.promotion_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  promotion_type character varying NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  earned_from character varying,
  expiry_date date,
  status character varying DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'cancelled')),
  used_at timestamp without time zone,
  used_in_order uuid REFERENCES public.orders(id),
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
```

### `wallet_settings` Table
**Wallet system settings**
```sql
CREATE TABLE public.wallet_settings (
  id integer PRIMARY KEY DEFAULT nextval('wallet_settings_id_seq'),
  setting_key character varying NOT NULL UNIQUE,
  setting_value text NOT NULL,
  data_type character varying DEFAULT 'string',
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. Content Management System

### `banners` Table
**Banner management**
```sql
CREATE TABLE public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  link text,
  active boolean DEFAULT true,
  position text,
  image text,
  is_mobile boolean
);
```

### `add_banner` Table
**Additional banner management**
```sql
CREATE TABLE public.add_banner (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text,
  banner_type text
);
```

### `add_banner_group` Table
**Banner group management**
```sql
CREATE TABLE public.add_banner_group (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text,
  image_url text,
  banner_id uuid REFERENCES public.add_banner(id)
);
```

### `add_banner_group_product` Table
**Banner group product associations**
```sql
CREATE TABLE public.add_banner_group_product (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES public.products(id),
  add_banner_group_id uuid REFERENCES public.add_banner_group(id)
);
```

### `video_banner` Table
**Video banner management**
```sql
CREATE TABLE public.video_banner (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  name text,
  video_url text,
  status boolean
);
```

### `shipping_banners` Table
**Shipping banner management**
```sql
CREATE TABLE public.shipping_banners (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  title text,
  active boolean,
  imageFile text,
  image_url text
);
```

---

## 6. Business Operations

### `Store` Table
**Store management**
```sql
CREATE TABLE public.Store (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL DEFAULT 'yes',
  image text DEFAULT 'yes',
  link text
);
```

### `SubStore` Table
**Sub-store management**
```sql
CREATE TABLE public.SubStore (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  image text,
  link text
);
```

### `Vendors` Table
**Vendor management**
```sql
CREATE TABLE public.Vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  legal_name text,
  business_type text,
  registration_type text,
  products_services text,
  website text,
  address_line_1 text,
  address_line_2 text,
  city text,
  region text,
  postal_code text,
  country text,
  additional_info text,
  representative_first text,
  representative_last text,
  pan text,
  gstin text,
  email text,
  phone text
);
```

### `bnb` Table
**B&B section management**
```sql
CREATE TABLE public.bnb (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text
);
```

### `bnb_group` Table
**B&B group management**
```sql
CREATE TABLE public.bnb_group (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text,
  image_url text,
  bnb_id uuid REFERENCES public.bnb(id)
);
```

### `bnb_group_product` Table
**B&B group product associations**
```sql
CREATE TABLE public.bnb_group_product (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES public.products(id),
  bnb_group_id uuid REFERENCES public.bnb_group(id)
);
```

### `quick_pick` Table
**Quick pick section management**
```sql
CREATE TABLE public.quick_pick (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text
);
```

### `quick_pick_group` Table
**Quick pick group management**
```sql
CREATE TABLE public.quick_pick_group (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text,
  image_url text,
  quick_pick_id uuid REFERENCES public.quick_pick(id)
);
```

### `quickpick_group_product` Table
**Quick pick group product associations**
```sql
CREATE TABLE public.quickpick_group_product (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  quick_pick_group_id uuid NOT NULL REFERENCES public.quick_pick_group(id),
  product_id uuid NOT NULL REFERENCES public.products(id)
);
```

### `saving_zone` Table
**Saving zone section management**
```sql
CREATE TABLE public.saving_zone (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text
);
```

### `saving_zone_group` Table
**Saving zone group management**
```sql
CREATE TABLE public.saving_zone_group (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text,
  image_url text,
  saving_zone_id uuid REFERENCES public.saving_zone(id)
);
```

### `saving_zone_group_product` Table
**Saving zone group product associations**
```sql
CREATE TABLE public.saving_zone_group_product (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES public.products(id),
  saving_zone_group_id uuid REFERENCES public.saving_zone_group(id)
);
```

### `unique_section` Table
**Unique section management**
```sql
CREATE TABLE public.unique_section (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  section_type text,
  image_url text
);
```

### `unique_section_product` Table
**Unique section product associations**
```sql
CREATE TABLE public.unique_section_product (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES public.products(id),
  unique_section_id uuid REFERENCES public.unique_section(id)
);
```

### `recommended_store` Table
**Recommended store management**
```sql
CREATE TABLE public.recommended_store (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  image_url text
);
```

### `product_recommended_store` Table
**Product recommended store associations**
```sql
CREATE TABLE public.product_recommended_store (
  product_id uuid NOT NULL REFERENCES public.products(id),
  recommended_store_id uuid NOT NULL REFERENCES public.recommended_store(id),
  PRIMARY KEY (product_id, recommended_store_id)
);
```

### `you_may_like` Table
**You may like product associations**
```sql
CREATE TABLE public.you_may_like (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES public.products(id)
);
```

---

## 7. Location & Logistics

### `pincode_locations` Table
**Pincode location data**
```sql
CREATE TABLE public.pincode_locations (
  pincode character varying PRIMARY KEY,
  latitude double precision,
  longitude double precision,
  created_at timestamp with time zone DEFAULT now()
);
```

---

## 8. Notifications & Communication

### `notifications` Table
**System notifications with user-specific read status**
```sql
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.users(id),
  heading text NOT NULL,
  description text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  expiry_date timestamp with time zone NOT NULL,
  image_url text,
  related_id uuid,
  related_type character varying,
  notification_type character varying DEFAULT 'user' CHECK (notification_type IN ('user', 'admin')),
  is_read boolean DEFAULT false,
  read_at timestamp without time zone
);
```

### `user_notifications` Table
**User-specific notifications with read status**
```sql
CREATE TABLE public.user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id),
  type character varying NOT NULL,
  title character varying NOT NULL,
  message text NOT NULL,
  related_id uuid,
  related_type character varying,
  is_read boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  read_at timestamp without time zone
);
```

### `enquiries` Table
**Customer enquiries**
```sql
CREATE TABLE public.enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id),
  name text,
  email text,
  phone text,
  message text,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  status character varying DEFAULT 'pending' CHECK (status IN ('pending', 'replied', 'resolved', 'closed')),
  admin_reply boolean DEFAULT false,
  admin_notes text,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  type character varying DEFAULT 'regular' CHECK (type IN ('regular', 'custom_printing'))
);
```

### `enquiry_items` Table
**Enquiry line items**
```sql
CREATE TABLE public.enquiry_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id uuid REFERENCES public.enquiries(id),
  product_id uuid REFERENCES public.products(id),
  product_name character varying,
  price numeric,
  quantity integer NOT NULL,
  customization text,
  product_image text
);
```

### `enquiry_replies` Table
**Enquiry replies**
```sql
CREATE TABLE public.enquiry_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id uuid REFERENCES public.enquiries(id),
  message text NOT NULL,
  is_admin boolean DEFAULT false,
  admin_id uuid,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
```

---

## 9. Additional Features

### `cart_items` Table
**Shopping cart management**
```sql
CREATE TABLE public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id),
  product_id uuid REFERENCES public.products(id),
  quantity integer NOT NULL DEFAULT 1,
  added_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
```

### `wishlist_items` Table
**Wishlist management**
```sql
CREATE TABLE public.wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id),
  product_id uuid REFERENCES public.products(id),
  added_at timestamp with time zone DEFAULT timezone('utc', now())
);
```

### `print_requests` Table
**Print request management**
```sql
CREATE TABLE public.print_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  product_type text NOT NULL,
  size text,
  color text,
  quantity integer DEFAULT 1,
  position text,
  image_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'in_progress', 'completed', 'rejected')),
  created_at timestamp with time zone DEFAULT now(),
  admin_note text DEFAULT '',
  estimated_price numeric DEFAULT 0.00,
  final_price numeric DEFAULT 0.00,
  price_notes text,
  enquiry_id uuid REFERENCES public.enquiries(id),
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  request_details text
);
```

### `print_request_replies` Table
**Print request replies**
```sql
CREATE TABLE public.print_request_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  print_request_id uuid REFERENCES public.print_requests(id),
  message text NOT NULL,
  is_admin boolean DEFAULT false,
  admin_id uuid,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
```

### `promotional_settings` Table
**Promotional settings management**
```sql
CREATE TABLE public.promotional_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key character varying NOT NULL UNIQUE,
  setting_value text,
  setting_type character varying DEFAULT 'text',
  category character varying DEFAULT 'promotion',
  description text,
  is_active boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);
```

### `product_grid_settings` Table
**Product grid settings**
```sql
CREATE TABLE public.product_grid_settings (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  is_visible boolean DEFAULT true
);
```

---

## Database Relationships

### Key Relationships:
1. **Users** → **Orders** (One-to-Many)
2. **Users** → **User_Wallets** (One-to-One)
3. **Products** → **Order_Items** (One-to-Many)
4. **Categories** → **Subcategories** (One-to-Many)
5. **Subcategories** → **Groups** (One-to-Many)
6. **Groups** → **Products** (One-to-Many)
7. **Orders** → **Order_Tracking** (One-to-Many)
8. **Wallets** → **Wallet_Transactions** (One-to-Many)

### Indexes and Constraints:
- All tables have proper primary keys
- Foreign key constraints maintain referential integrity
- Check constraints ensure data validity
- Unique constraints prevent duplicates
- Default values provide sensible defaults

---

## Performance Considerations

### Recommended Indexes:
```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);

-- Product searches
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_products_featured ON products(featured);

-- Order queries
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Wallet transactions
CREATE INDEX idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_created_at ON wallet_transactions(created_at);
```

---

## Security Features

### Data Protection:
- UUID primary keys prevent enumeration attacks
- Proper foreign key constraints maintain data integrity
- Check constraints validate data at database level
- Timestamp fields for audit trails

### Access Control:
- Role-based access through user roles
- Admin-specific tables for administrative functions
- User-specific data isolation through foreign keys

---

## Future Enhancements

### Potential Additions:
1. **Analytics Tables**: User behavior tracking
2. **Audit Logs**: Comprehensive change tracking
3. **API Keys**: Third-party integration support
4. **Multi-currency**: International expansion
5. **Inventory Management**: Advanced stock tracking
6. **Loyalty Programs**: Customer retention features

---

## Conclusion

This database schema provides a comprehensive foundation for a modern e-commerce platform with advanced features including:

- ✅ Complete user management system
- ✅ Sophisticated product catalog with categories and groups
- ✅ Full order management with tracking and returns
- ✅ Advanced wallet system with multiple payment methods
- ✅ Content management for banners and promotions
- ✅ Business operations support for vendors and partners
- ✅ Communication systems for enquiries and notifications
- ✅ Location and logistics support

The schema is designed for scalability, maintainability, and performance while ensuring data integrity and security.
