🧳 Tourify — Backend API

[🇬🇧 English](https://github.com/vvcuong-dev/tourify-backend/blob/main/README.md)

Hệ thống đặt tour du lịch trực tuyến, cho phép khách hàng tìm kiếm và đặt tour mà **không cần đăng nhập**, trong khi quản trị viên quản lý toàn bộ nội dung (tour, danh mục, đơn hàng...) qua khu vực có xác thực JWT. Được xây dựng với Node.js 22, NestJS 11, TypeScript, Prisma 7 và MySQL, có tích hợp thanh toán ZaloPay.

## 📋 Mục Lục

- [Tính Năng](#-tính-năng)
- [Tech Stack](#️-tech-stack)
- [Kiến Trúc](#️-kiến-trúc)
- [Bắt Đầu](#-bắt-đầu)
- [Biến Môi Trường](#-biến-môi-trường)
- [Cơ Sở Dữ Liệu](#️-cơ-sở-dữ-liệu)
- [API Endpoints](#-api-endpoints)
- [Xác Thực & Phân Quyền](#-xác-thực--phân-quyền)
- [Các Quyết Định Thiết Kế](#-các-quyết-định-thiết-kế)
- [Cấu Trúc Dự Án](#-cấu-trúc-dự-án)
- [Lệnh Scripts](#-lệnh-scripts)
- [License](#-license)

## ✨ Tính Năng

### Khách hàng (không cần tài khoản)

- **Duyệt & tìm kiếm tour** — theo danh mục, thành phố/địa điểm, khoảng giá, ngày khởi hành
- **Xem chi tiết tour, danh mục** — theo slug (SEO-friendly), kèm breadcrumb và page title
- **Xem danh sách thành phố/địa điểm** — dùng để lọc tour
- **Giỏ hàng phía client** — giỏ hàng lưu ở frontend (localStorage); backend chỉ tính lại giá và kiểm tra tồn kho tại thời điểm đặt để tránh sai lệch giá
- **Đặt tour (guest checkout)** — nhập thông tin (họ tên, email, SĐT, ghi chú) mà không cần tạo tài khoản
- **Thanh toán** — Tiền mặt, Chuyển khoản, hoặc ZaloPay (redirect + callback cập nhật trạng thái tự động)
- **Tra cứu đơn hàng** — theo mã đơn hàng (order code) + email

### Quản trị viên (yêu cầu đăng nhập)

- **Xác thực** — đăng ký, đăng nhập, refresh token, đăng xuất, đổi mật khẩu, đổi email
- **Hồ sơ cá nhân** — xem/cập nhật profile, đổi avatar (Cloudinary)
- **Quản lý tài khoản quản trị** — CRUD, cập nhật trạng thái (ACTIVE/PENDING/INACTIVE/BANNED)
- **Quản lý danh mục** — dạng cây (parent/children), upload ảnh, sắp xếp vị trí, bật/tắt hàng loạt, xoá mềm
- **Quản lý tour** — CRUD, upload avatar + nhiều ảnh, quản lý lịch trình, giá & tồn kho theo từng loại khách, bật/tắt hàng loạt, xoá mềm
- **Quản lý đơn hàng** — xem danh sách, chi tiết, cập nhật trạng thái đơn (INITIAL → DONE / CANCEL)

## 🛠️ Tech Stack

| Tầng            | Công nghệ                                                        |
| --------------- | ---------------------------------------------------------------- |
| Runtime         | Node.js 22                                                       |
| Ngôn ngữ        | TypeScript 5.9                                                   |
| Framework       | NestJS 11 (trên nền Express)                                     |
| Cơ sở dữ liệu   | MySQL 9 (qua Docker)                                             |
| ORM             | Prisma 7 (`@prisma/adapter-mariadb`)                             |
| Cache / Session | Redis 8                                                          |
| Xác thực        | JWT (`@nestjs/jwt`, `passport-jwt`) + bcrypt                     |
| Validation      | class-validator, class-transformer                               |
| Upload ảnh      | Cloudinary                                                       |
| Thanh toán      | ZaloPay (sandbox)                                                |
| Docs            | Swagger (`@nestjs/swagger`)                                      |
| Package Mgr     | pnpm                                                             |
| Testing         | Jest, Supertest _(sẽ bổ sung sau — hiện repo chưa có unit test)_ |

## 🏗️ Kiến Trúc

```
Client Request
      │
      ▼
┌─────────────────────────────────────────────────────┐
│                     NestJS App                      │
│                                                     │
│    Controller -> Service -> Repository (Prisma)     │
│    (Admin / *-Client, JwtAuthGuard khi cần)         │
│                                                     │
│              Service còn gọi tới:                   │
│    Redis (cache) - Cloudinary (upload) - ZaloPay    │
└─────────────────────────────────────────────────────┘
      │
      ▼
┌───────────────┐   ┌───────────────┐
│   MySQL 9     │   │   Redis 8     │
│   (Docker)    │   │   (Docker)    │
└───────────────┘   └───────────────┘
```

Các module nghiệp vụ chính (`tour`, `category`, `order`) có **hai controller/service riêng**: một dành cho **quản trị** (`@Controller('admin/...')` + `@UseGuards(JwtAuthGuard)`, đầy đủ CRUD) và một dành cho **client** (`*-client`, `@Controller('...')` không prefix `admin`, công khai, chỉ đọc hoặc thao tác giới hạn như đặt tour). Riêng `cart`, `city`, `payment` chỉ có 1 controller và đều là public.

## 🚀 Bắt Đầu

### Yêu cầu

- Docker & Docker Compose
- Node.js 22+
- pnpm

### 1. Khởi chạy hạ tầng (MySQL + phpMyAdmin + Redis)

MySQL, phpMyAdmin và Redis được định nghĩa chung trong 1 file `docker-compose.yml` ở thư mục gốc dự án:

```bash
docker compose up -d
```

Lệnh này khởi chạy:

- **MySQL** — `localhost:3307`
- **phpMyAdmin** — `http://localhost:8080`
- **Redis** — `localhost:6379`

### 2. Cài đặt & chạy backend

```bash
cd tourify-backend

# 1. Cài dependencies
pnpm install

# 2. Tạo file môi trường
cp .env.example .env
# → chỉnh sửa các giá trị cho phù hợp (xem mục Biến Môi Trường)

# 3. Chạy migration
pnpm prisma migrate dev

# 4. (tuỳ chọn) Generate lại Prisma Client
pnpm prisma generate

# 5. Khởi chạy dev server (hot reload)
pnpm start:dev
```

API sẽ chạy tại `http://localhost:3000` và Swagger docs tại `http://localhost:3000/api` _(tuỳ đường dẫn cấu hình trong `main.ts`)_.

### ⚠️ Lưu ý khi test thanh toán ZaloPay (local)

ZaloPay cần gọi callback về server của bạn, nên khi chạy local **bắt buộc phải expose qua ngrok** (hoặc tunnel tương đương):

```bash
ngrok http 3000
```

Sau đó cập nhật biến `DOMAIN_WEBSITE` trong `.env` bằng domain ngrok vừa tạo (đổi mỗi lần restart ngrok bản free), rồi khởi động lại server để ZaloPay callback hoạt động đúng.

## 🔧 Biến Môi Trường

Tạo file `.env` từ `.env.example`:

```dotenv
# Server
PORT=3000
NODE_ENV=development

# Database (Prisma)
DATABASE_URL="mysql://root:<password>@localhost:3307/tourify"

# JWT
JWT_ACCESS_SECRET="<random-secret>"
JWT_REFRESH_SECRET="<random-secret>"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Cloudinary
CLOUDINARY_NAME="<cloud-name>"
CLOUDINARY_API_KEY="<api-key>"
CLOUDINARY_API_SECRET="<api-secret>"

# ZaloPay (sandbox)
ZALOPAY_APP_ID=2554
ZALOPAY_KEY1="<key1>"
ZALOPAY_KEY2="<key2>"
ZALOPAY_ENDPOINT="https://sb-openapi.zalopay.vn/v2/create"
DOMAIN_WEBSITE="https://<your-ngrok-domain>.ngrok-free.app"
```

⚠️ **Quan trọng:** không commit file `.env` thật (chứa secret) lên Git — chỉ commit `.env.example` với giá trị giả. `DOMAIN_WEBSITE` cần cập nhật lại mỗi khi domain ngrok thay đổi.

## 🗃️ Cơ Sở Dữ Liệu

### Bảng (8 bảng)

| Bảng             | Mô tả                                                              |
| ---------------- | ------------------------------------------------------------------ |
| `users`          | Tài khoản quản trị viên (khách hàng không có tài khoản)            |
| `categories`     | Danh mục tour, dạng cây (tự tham chiếu parent/children)            |
| `cities`         | Thành phố / địa điểm                                               |
| `tours`          | Thông tin tour: giá, tồn kho, lịch trình, trạng thái               |
| `tour_images`    | Ảnh của tour (nhiều ảnh/tour, lưu trên Cloudinary)                 |
| `tour_locations` | Quan hệ nhiều-nhiều giữa `tours` và `cities`                       |
| `orders`         | Đơn đặt tour (guest checkout — lưu trực tiếp thông tin khách)      |
| `order_items`    | Chi tiết từng tour trong đơn hàng (snapshot giá tại thời điểm đặt) |

### Quan hệ chính

- `Category` tự tham chiếu (`parent` / `children`) để tạo cây danh mục
- `Tour` thuộc 1 `Category`, có nhiều `TourImage`, và liên kết nhiều `City` qua `TourLocation`
- `Order` có nhiều `OrderItem`; mỗi `OrderItem` **lưu snapshot** giá & số lượng theo loại khách (adult/children/baby) tại thời điểm đặt — không phụ thuộc giá `Tour` thay đổi sau này
- Soft delete (`deleted`, `deletedBy`) áp dụng cho `Category`, `Tour`, `User`

### Enums

| Enum             | Giá trị                           |
| ---------------- | --------------------------------- |
| `UserStatus`     | ACTIVE, PENDING, INACTIVE, BANNED |
| `CategoryStatus` | ACTIVE, INACTIVE                  |
| `TourStatus`     | ACTIVE, INACTIVE                  |
| `OrderStatus`    | INITIAL, DONE, CANCEL             |
| `PaymentMethod`  | CASH, ZALOPAY, BANK_TRANSFER      |
| `PaymentStatus`  | UNPAID, PAID                      |

### Migration

```bash
pnpm prisma migrate dev --name <ten_migration>
```

## 📡 API Endpoints

Tổng cộng **31 endpoints**, chia làm khu vực **Admin** (`/admin/...`, yêu cầu JWT) và **Public** (không có prefix `/admin`, phục vụ khách vãng lai).

### Auth (`/admin/auth`) — 6 endpoints

| Method | Endpoint                      | Quyền  | Mô tả                      |
| ------ | ----------------------------- | ------ | -------------------------- |
| POST   | `/admin/auth/register`        | Public | Đăng ký tài khoản quản trị |
| POST   | `/admin/auth/login`           | Public | Đăng nhập, trả về cặp JWT  |
| POST   | `/admin/auth/refresh-token`   | Public | Làm mới access token       |
| POST   | `/admin/auth/logout`          | Auth   | Đăng xuất                  |
| PATCH  | `/admin/auth/change-password` | Auth   | Đổi mật khẩu               |
| PATCH  | `/admin/auth/change-email`    | Auth   | Đổi email                  |

### Users (`/admin/users`) — Auth — 8 endpoints

| Method | Endpoint               | Mô tả                                         |
| ------ | ---------------------- | --------------------------------------------- |
| GET    | `/admin/users/profile` | Lấy profile của chính mình                    |
| PATCH  | `/admin/users/profile` | Cập nhật profile của chính mình               |
| POST   | `/admin/users/avatar`  | Đổi avatar của chính mình (upload Cloudinary) |
| GET    | `/admin/users`         | Danh sách người dùng (phân trang, lọc)        |
| GET    | `/admin/users/:id`     | Chi tiết người dùng                           |
| POST   | `/admin/users`         | Tạo người dùng mới                            |
| PATCH  | `/admin/users/:id`     | Cập nhật người dùng                           |
| DELETE | `/admin/users/:id`     | Xoá mềm người dùng                            |

### Categories

**Admin (`/admin/categories`) — Auth — 7 endpoints**

| Method | Endpoint                         | Mô tả                                |
| ------ | -------------------------------- | ------------------------------------ |
| GET    | `/admin/categories`              | Danh sách danh mục (lọc, phân trang) |
| GET    | `/admin/categories/tree`         | Lấy danh mục dạng cây                |
| GET    | `/admin/categories/:id`          | Chi tiết danh mục theo id            |
| POST   | `/admin/categories`              | Tạo danh mục                         |
| POST   | `/admin/categories/:id/image`    | Upload ảnh danh mục                  |
| PATCH  | `/admin/categories/change-multi` | Đổi trạng thái hàng loạt             |
| PATCH  | `/admin/categories/:id`          | Cập nhật danh mục                    |
| DELETE | `/admin/categories/:id`          | Xoá mềm danh mục                     |

**Client (`/categories`) — Public — 1 endpoint**

| Method | Endpoint            | Mô tả                       |
| ------ | ------------------- | --------------------------- |
| GET    | `/categories/:slug` | Chi tiết danh mục theo slug |

### Cities (`/cities`) — Public — 1 endpoint

| Method | Endpoint  | Mô tả                                |
| ------ | --------- | ------------------------------------ |
| GET    | `/cities` | Danh sách toàn bộ thành phố/địa điểm |

### Tours

**Admin (`/admin/tours`) — Auth — 9 endpoints**

| Method | Endpoint                           | Mô tả                            |
| ------ | ---------------------------------- | -------------------------------- |
| GET    | `/admin/tours`                     | Danh sách tour (lọc, phân trang) |
| GET    | `/admin/tours/:id`                 | Chi tiết tour theo id            |
| POST   | `/admin/tours`                     | Tạo tour                         |
| PATCH  | `/admin/tours/change-multi`        | Đổi trạng thái hàng loạt         |
| PATCH  | `/admin/tours/:id`                 | Cập nhật tour                    |
| DELETE | `/admin/tours/:id`                 | Xoá mềm tour                     |
| POST   | `/admin/tours/:id/avatar`          | Upload ảnh đại diện tour         |
| POST   | `/admin/tours/:id/images`          | Upload nhiều ảnh tour            |
| DELETE | `/admin/tours/:id/images/:imageId` | Xoá 1 ảnh tour                   |

**Client (`/tours`) — Public — 2 endpoints**

| Method | Endpoint        | Mô tả                                                          |
| ------ | --------------- | -------------------------------------------------------------- |
| GET    | `/tours/search` | Tìm kiếm tour công khai (lọc theo danh mục, thành phố, giá...) |
| GET    | `/tours/:slug`  | Chi tiết tour theo slug, kèm breadcrumb + danh sách thành phố  |

### Cart (`/cart`) — Public — 1 endpoint

| Method | Endpoint       | Mô tả                                                                     |
| ------ | -------------- | ------------------------------------------------------------------------- |
| POST   | `/cart/detail` | Nhận danh sách item (tourId, số lượng...), trả về giá & chi tiết giỏ hàng |

### Orders

**Client (`/orders`) — Public — 2 endpoints**

| Method | Endpoint                    | Mô tả                                |
| ------ | --------------------------- | ------------------------------------ |
| POST   | `/orders`                   | Tạo đơn hàng mới (guest checkout)    |
| GET    | `/orders?orderCode=&email=` | Tra cứu đơn hàng theo mã đơn + email |

**Admin (`/admin/orders`) — Auth — 3 endpoints**

| Method | Endpoint            | Mô tả                                |
| ------ | ------------------- | ------------------------------------ |
| GET    | `/admin/orders`     | Danh sách đơn hàng (lọc, phân trang) |
| GET    | `/admin/orders/:id` | Chi tiết đơn hàng                    |
| PATCH  | `/admin/orders/:id` | Cập nhật trạng thái đơn hàng         |

### Payment (`/payment`) — Public — 2 endpoints

| Method | Endpoint                    | Mô tả                                                           |
| ------ | --------------------------- | --------------------------------------------------------------- |
| POST   | `/payment/zalopay/create`   | Tạo giao dịch ZaloPay, trả về link thanh toán                   |
| POST   | `/payment/zalopay/callback` | Webhook ZaloPay cập nhật trạng thái thanh toán (`data` + `mac`) |

## 🔐 Xác Thực & Phân Quyền

```
Đăng nhập (Admin) → Access Token (15 phút) + Refresh Token (7 ngày)
                │
                ▼
  Access Token hết hạn → Gọi /admin/auth/refresh-token → Access Token mới
                │
                ▼
     Đăng xuất → Gọi /admin/auth/logout → Access token bị vô hiệu
```

- **Access Token:** sống ngắn (15 phút), gửi qua header `Authorization: Bearer <token>`
- **Refresh Token:** sống dài (7 ngày)
- **JwtAuthGuard** (`common/guards/jwt-auth.guard.ts`) áp dụng theo từng controller (`@UseGuards(JwtAuthGuard)`) cho toàn bộ route dưới `/admin/...`; các controller `*-client` (`categories`, `tours`, `orders`, `cart`, `payment`, `cities`) không gắn guard này vì phục vụ khách vãng lai
- Không có hệ thống role đa cấp (OWNER/CASHIER/...) như một số hệ thống khác — `User` hiện chỉ đại diện cho **tài khoản quản trị**, phân biệt qua `status` chứ chưa có field `role` riêng

## 🎯 Các Quyết Định Thiết Kế

| Quyết định                                                  | Lý do                                                                                                   |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Khách hàng không cần tài khoản                              | Giảm ma sát khi đặt tour — tăng tỉ lệ chuyển đổi                                                        |
| `Order` lưu trực tiếp thông tin khách (không FK đến `User`) | Vì không có tài khoản khách hàng, `User` chỉ dành cho quản trị                                          |
| Giỏ hàng lưu ở frontend (localStorage)                      | Đơn giản hoá backend; backend chỉ là nguồn chân lý (source of truth) về giá & tồn kho tại thời điểm đặt |
| `OrderItem` snapshot giá tại thời điểm đặt                  | Tránh sai lệch khi giá `Tour` thay đổi sau khi khách đã đặt                                             |
| Tách controller Admin / Client (`*-client`)                 | Phân tách rõ route công khai và route cần xác thực, tránh nhầm lẫn quyền truy cập                       |
| Category dạng cây tự tham chiếu                             | Hỗ trợ danh mục cha/con linh hoạt                                                                       |
| Soft delete (`deleted` flag)                                | Giữ lại dữ liệu lịch sử, không xoá cứng khỏi DB                                                         |
| ZaloPay cần domain public (ngrok khi dev)                   | Callback thanh toán yêu cầu server có thể truy cập từ internet                                          |

## 📁 Cấu Trúc Dự Án

```
tourify-backend/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── common/                 # DTO dùng chung, guard, exception, enum, type
│   ├── configs/                # Cấu hình app, database, jwt, redis, cloudinary, zalopay
│   ├── constants/               # Hằng số (cache key, error code, upload...)
│   ├── generated/prisma/        # Prisma Client được generate
│   ├── modules/
│   │   ├── auth/                # Đăng nhập, đăng ký, refresh token
│   │   ├── user/                # Quản lý tài khoản quản trị
│   │   ├── category/            # Danh mục (admin + client)
│   │   ├── city/                # Thành phố/địa điểm (public, chỉ đọc)
│   │   ├── tour/                # Tour (admin + client)
│   │   ├── cart/                # Tính giá giỏ hàng
│   │   ├── order/                # Đơn hàng (admin + client)
│   │   ├── payment/              # ZaloPay
│   │   ├── cloudinary/           # Upload ảnh
│   │   ├── redis/                # Cache service
│   │   └── token/                # Quản lý refresh token
│   ├── passports/                # Chiến lược Passport JWT
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── models/                # Định nghĩa từng model (tách file)
│   │   ├── enums/                  # Định nghĩa từng enum (tách file)
│   │   └── migrations/
│   └── utils/                     # Helper: slug, order-code, password, multer...
├── docker-compose.yml           # MySQL + phpMyAdmin + Redis
├── .env.example
├── package.json
└── tsconfig.json
```

## 📜 Lệnh Scripts

| Lệnh                      | Mô tả                               |
| ------------------------- | ----------------------------------- |
| `pnpm start:dev`          | Khởi chạy dev server với hot reload |
| `pnpm build`              | Build ra thư mục `dist/`            |
| `pnpm start:prod`         | Chạy bản production đã build        |
| `pnpm lint`               | Kiểm tra & tự sửa lỗi ESLint        |
| `pnpm format`             | Format code với Prettier            |
| `pnpm prisma migrate dev` | Chạy migration                      |
| `pnpm prisma generate`    | Generate lại Prisma Client          |
| `pnpm prisma studio`      | Mở giao diện xem/sửa dữ liệu        |

> `pnpm test` hiện chưa cấu hình đầy đủ do các file `*.spec.ts` đã được gỡ bỏ tạm thời — sẽ bổ sung khi viết unit test.

## 🐳 Docker

```
services:
  mysql        → localhost:3307  (root / 123456)
  phpmyadmin   → http://localhost:8080
  redis        → localhost:6379
```

```bash
docker compose up -d          # khởi chạy toàn bộ dịch vụ
docker compose down           # dừng toàn bộ dịch vụ
docker compose down -v        # dừng và xoá volume (reset dữ liệu)
```

## 📄 License

UNLICENSED
