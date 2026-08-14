# BiteHub Online

Restaurant Online Ordering System — Master Development Prompt

Build a complete, modern, responsive Restaurant Online Ordering System called “BiteHub”.

This should NOT be a simple restaurant landing page. It should be a functional web application with a customer-facing ordering system and a separate admin dashboard for restaurant management.

The application should have a clean, modern, premium restaurant UI with excellent UX, smooth interactions, responsive layouts, proper loading states, empty states, validation, and error handling.

1. TECHNOLOGY & ARCHITECTURE

Build the application using a modern frontend architecture.

Use:

React

TypeScript

Tailwind CSS

Modern component-based architecture

Responsive design

Supabase for database and authentication if supported

Proper API/data layer

Reusable UI components

Form validation

Toast notifications

Loading and error states

Keep the code clean, modular, scalable, and production-ready.

Do not put everything into one large component.

2. CUSTOMER-FACING APPLICATION

Create the following customer sections:

Home

Create an attractive restaurant homepage containing:

Restaurant logo

Navigation

Hero section

Restaurant tagline

“Order Now” CTA

Featured dishes

Popular categories

Best-selling items

Special offers

Customer reviews

Restaurant information

Footer

The main CTA should take users directly to the menu/order section.

3. MENU PAGE

Create a complete menu page.

Include:

Search bar

Food categories

Category tabs

Food cards

Food image

Food name

Description

Price

Rating

Availability status

Add to Cart button

Example categories:

Burgers

Pizza

Chicken

Pasta

Appetizers

Desserts

Drinks

Categories should be dynamically loaded rather than hard-coded wherever possible.

4. FOOD ITEM DETAILS

When a customer clicks a food item, open a detailed product page or modal.

Show:

Large food image

Food name

Description

Price

Rating

Ingredients

Available customization options

Quantity selector

Special instructions

Add to Cart button

Example customization:

Burger:

Single / Double

Extra Cheese

Extra Patty

Remove Onion

Add Sauce

The final price should update automatically based on selected options.

5. SEARCH & FILTERING

Implement functional search.

Customers should be able to search by:

Food name

Category

Description

Add filters such as:

Category

Price range

Popularity

Rating

Include a clear button to reset filters.

Search and filtering should update the displayed food items dynamically.

6. SHOPPING CART

Create a complete shopping cart.

Each cart item should show:

Food image

Food name

Selected options

Price

Quantity

Increase quantity

Decrease quantity

Remove item

Show:

Subtotal

Delivery fee

Tax

Discount

Final total

The cart total must update automatically whenever the quantity or item changes.

Add:

“Proceed to Checkout”

button.

If the cart is empty, show a professional empty-cart state with a button:

“Browse Menu”

7. CHECKOUT

Create a professional checkout page.

Customer information:

Full Name

Email

Phone Number

Delivery Address

City

Additional Instructions

Order type:

Delivery

Pickup

Payment method UI:

Cash on Delivery

Card Payment

Online Payment

For now, payment can be implemented as a UI/demo flow unless a real payment gateway is configured.

Show an order summary on the checkout page.

Include:

Items

Quantity

Subtotal

Delivery fee

Tax

Discount

Final total

Add:

Place Order

button.

Validate all required fields before placing the order.

8. ORDER CONFIRMATION

After placing an order, show a professional order confirmation page.

Display:

Order Confirmed 🎉

Show:

Order ID

Customer name

Order items

Total amount

Order type

Estimated delivery/pickup time

Add:

Track Order

button.

9. ORDER TRACKING

Create a dedicated order tracking page.

Show the order status using a visual progress tracker:

Order Placed

Order Confirmed

Preparing

Ready

Out for Delivery

Delivered

For pickup orders:

Order Placed

Order Confirmed

Preparing

Ready for Pickup

Picked Up

The status should come from the database.

When the admin changes the order status, the customer-facing order tracking page should reflect the updated status.

10. CUSTOMER ACCOUNT

Create authentication.

Customers should be able to:

Sign up

Login

Logout

Reset password

Create a customer dashboard.

Dashboard sections:

Profile

My Orders

Order Details

Saved Addresses

Account Settings

My Orders should show:

Order ID

Date

Items

Total

Status

View Order button

11. ADMIN DASHBOARD

Create a completely separate admin dashboard.

Admin should be able to manage the restaurant.

Dashboard should include:

Total Orders

Pending Orders

Completed Orders

Total Revenue

Total Customers

Popular Items

Use attractive statistics cards and charts.

12. ADMIN MENU MANAGEMENT

Create a menu management section.

Admin can:

Add food item

Edit food item

Delete food item

Update price

Upload/change image

Add description

Add ingredients

Select category

Set availability

Mark item as featured

Add customization options

Example:

Food:

Classic Beef Burger

Price:

Rs. 799

Category:

Burgers

Availability:

Available

Featured:

Yes

Changes made by admin must appear on the customer menu automatically through the shared database.

Do NOT create separate fake customer and admin data.

Use the same database.

13. ADMIN CATEGORY MANAGEMENT

Admin should be able to:

Create categories

Edit categories

Delete categories

Set category image

Enable/disable category

Customer menu should automatically reflect category changes.

14. ADMIN ORDER MANAGEMENT

Create an order management page.

Admin should see:

Order ID

Customer

Items

Total

Order type

Payment method

Date/time

Current status

Admin can change order status:

Pending

Confirmed

Preparing

Ready

Out for Delivery

Delivered

Cancelled

When admin updates the status, it must update the customer's order tracking page.

15. ADMIN CUSTOMER MANAGEMENT

Admin should be able to view:

Customer name

Email

Phone

Number of orders

Total spending

Recent order

Account status

Add search and filtering.

16. DATABASE STRUCTURE

Create a proper relational database structure.

Suggested tables:

users

id

name

email

phone

role

created_at

Roles:

customer

admin

categories

id

name

description

image

is_active

created_at

menu_items

id

category_id

name

description

price

image

ingredients

rating

is_available

is_featured

created_at

orders

id

user_id

order_status

order_type

subtotal

delivery_fee

tax

discount

total

delivery_address

customer_phone

notes

created_at

order_items

id

order_id

menu_item_id

quantity

price

selected_options

reviews

id

user_id

menu_item_id

rating

comment

created_at

17. ADMIN AUTHENTICATION & SECURITY

Admin pages must NOT be publicly accessible.

Implement role-based access.

Customers should not be able to access:

Admin dashboard

Menu management

Category management

Order management

Customer management

Only authenticated admin users can access these pages.

Protect routes properly.

Do not rely only on hiding buttons from the frontend.

18. RESPONSIVE DESIGN

The entire application must be fully responsive.

Support:

Desktop

Laptop

Tablet

Mobile

On mobile:

Use a mobile-friendly navigation

Make food cards responsive

Make cart easy to use

Make checkout forms comfortable

Make admin tables horizontally scrollable or transform them into mobile cards

Ensure no text or buttons overflow

Pay special attention to:

Buttons

Cards

Navigation

Forms

Tables

Cart

Order tracking

Nothing should overflow the viewport.

19. UI DESIGN

Use a modern premium restaurant aesthetic.

Suggested visual direction:

Warm food-inspired accent color

Clean white/light background

Dark text

Rounded cards

Soft shadows

High-quality food imagery

Modern typography

Spacious layout

Subtle hover animations

Smooth transitions

Avoid excessive animations.

The UI should feel like a real food-ordering platform, not a basic student project.

20. UX REQUIREMENTS

Include:

Loading skeletons

Empty states

Error states

Success notifications

Confirmation dialogs

Form validation

Disabled states

Hover states

Active states

Examples:

When adding an item:

“Classic Beef Burger added to cart.”

When deleting an item:

Show confirmation:

“Are you sure you want to delete this item?”

21. DATA HANDLING

Do not use static mock data for core functionality once the database is connected.

Menu items should come from the database.

Orders should be stored in the database.

Customers should be stored in the database.

Admin changes should affect customer-facing pages.

Cart should persist appropriately.

Order history should belong to the authenticated customer.

22. REAL-WORLD WORKFLOW

The main workflow should work like this:

Customer:

Browse Menu
↓
Search / Filter
↓
Select Food
↓
Customize
↓
Add to Cart
↓
Checkout
↓
Place Order
↓
Order Saved to Database
↓
Admin Receives Order
↓
Admin Changes Status
↓
Customer Sees Updated Status
↓
Order Delivered / Picked Up

This complete workflow is the most important functionality of the application.

23. DEMO DATA

Initially populate the application with realistic restaurant data.

Create at least:

6 categories

20 menu items

Different prices

Food descriptions

Food images

Featured items

Popular items

Use Pakistani Rupees (PKR / Rs.) for pricing.

Example:

Classic Beef Burger — Rs. 799

Chicken Pizza — Rs. 1,299

Loaded Fries — Rs. 499

Chocolate Brownie — Rs. 399

Fresh Lemonade — Rs. 249

24. PROJECT PAGES

Create these routes/pages:

Customer:

/

/menu

/menu/:id

/cart

/checkout

/order-success

/track-order/:id

/login

/register

/profile

/orders

/orders/:id

Admin:

/admin

/admin/menu

/admin/menu/new

/admin/menu/:id/edit

/admin/categories

/admin/orders

/admin/customers

/admin/reviews

/admin/settings

25. CODE QUALITY

Follow these rules:

Reusable components

Clean folder structure

Meaningful variable names

No unnecessary duplicate code

No hard-coded repeated values

Proper error handling

Proper form validation

Accessible buttons and forms

Semantic HTML

Responsive CSS

Secure authentication

Proper route protection

Do not create unnecessary pages or features just to make the project larger.

Focus on polished, functional core features.

26. FINAL QUALITY CHECK

Before considering the project complete, test:

Registration

Login

Logout

Menu browsing

Search

Filters

Food details

Customization

Add to cart

Quantity updates

Remove from cart

Checkout

Order creation

Order tracking

Admin login

Add menu item

Edit menu item

Delete menu item

Category management

Order status update

Customer order history

Responsive mobile layout

Error handling

Empty states

Make sure the complete customer → database → admin → customer workflow works correctly.

The final result should look and feel like a real production-ready restaurant ordering platform rather than a basic demo website.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4ff77f0b-f50b-4033-9592-0ae9cdf19288).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
