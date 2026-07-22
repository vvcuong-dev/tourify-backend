🧳 Tourify — Backend API

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
- **Xem chi tiết tour** — hình ảnh, lịch trình (schedule), giá theo người lớn/trẻ em/em bé, số chỗ còn lại
- **Giỏ hàng phía client** — giỏ hàng lưu ở frontend (localStorage); backend chỉ tính lại giá và kiểm tra tồn kho tại thời điểm đặt để tránh sai lệch giá
- **Đặt tour (guest checkout)** — nhập thông tin (họ tên, email, SĐT, ghi chú) mà không cần tạo tài khoản
- **Thanh toán** — Tiền mặt, Chuyển khoản, hoặc ZaloPay (redirect + callback cập nhật trạng thái tự động)
- **Tra cứu đơn hàng** — theo mã đơn hàng (order code)

### Quản trị viên (yêu cầu đăng nhập)

- **Xác thực** — JWT access/refresh token, đổi mật khẩu, đổi email
- **Quản lý tài khoản quản trị** — CRUD, cập nhật trạng thái (ACTIVE/PENDING/INACTIVE/BANNED)
- **Quản lý danh mục** — dạng cây (parent/children), sắp xếp vị trí, bật/tắt hàng loạt
- **Quản lý tour** — CRUD, upload nhiều ảnh (Cloudinary), quản lý lịch trình, giá & tồn kho theo từng loại khách, bật/tắt hàng loạt
- **Quản lý thành phố/địa điểm** — gắn với tour qua bảng quan hệ nhiều-nhiều
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
┌─────────────────────────────────────────────┐
│  NestJS App                                  │
│  ┌───────────┐  ┌────────────┐  ┌─────────┐ │
│  │ Middleware │→ │ Controller │→ │ Pipe    │ │
│  │ (Guard,    │  │ (Admin /   │  │ (Zod/   │ │
│  │  JwtAuth)  │  │  *-Client) │  │  class- │ │
│  │            │  │            │  │validator)│ │
│  └───────────┘  └─────┬──────┘  └─────────┘ │
│                       │                      │
│                       ▼                      │
│                 ┌──────────┐                 │
│                 │  Service  │  (Business     │
│                 └─────┬────┘   Logic)        │
│                       │                      │
│           ┌───────────┼────────────┐         │
│           ▼           ▼            ▼         │
│      ┌─────────┐ ┌─────────┐ ┌───────────┐   │
│      │ Prisma  │ │  Redis  │ │Cloudinary/│   │
│      │ Client  │ │ Service │ │  ZaloPay  │   │
│      └────┬────┘ └────┬────┘ └───────────┘   │
└───────────┼───────────┼───────────────────────┘
            ▼           ▼
       ┌─────────┐ ┌─────────┐
       │ MySQL 9 │ │ Redis 8 │
       │ (Docker)│ │ (Docker)│
       └─────────┘ └─────────┘
```

Mỗi module nghiệp vụ chính (`tour`, `category`, `order`, `payment`) có **hai lớp controller/service**: một dành cho **quản trị** (yêu cầu JWT, đầy đủ CRUD) và một dành cho **client** (`*-client`, công khai, chỉ đọc hoặc thao tác giới hạn như đặt tour).

## 🚀 Bắt Đầu

### Yêu cầu

- Docker & Docker Compose
- Node.js 22+
- pnpm

### 1. Khởi chạy hạ tầng (MySQL + phpMyAdmin + Redis)

Dự án tách hạ tầng ra 2 docker-compose riêng (đặt ngoài thư mục backend):

```bash
# Thư mục chứa MySQL + phpMyAdmin
cd mysql-database
docker compose up -d

# Thư mục chứa Redis
cd ../redis-database
docker compose up -d
```

> 💡 Có thể gộp 2 file này thành 1 `docker-compose.yml` duy nhất trong thư mục `infra/` nếu muốn quản lý tập trung — xem gợi ý ở cuối README.

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

> Danh sách dưới đây tổng hợp theo module — kiểm tra lại path/method chính xác trong từng `*.controller.ts` khi viết Swagger.

### Auth (`/auth`)

| Method | Endpoint                | Quyền  | Mô tả                      |
| ------ | ----------------------- | ------ | -------------------------- |
| POST   | `/auth/register`        | Public | Đăng ký tài khoản quản trị |
| POST   | `/auth/login`           | Public | Đăng nhập, trả về cặp JWT  |
| POST   | `/auth/refresh`         | Public | Làm mới access token       |
| PATCH  | `/auth/change-password` | Auth   | Đổi mật khẩu               |
| PATCH  | `/auth/change-email`    | Auth   | Đổi email                  |

### Users (`/users`) — Auth (Admin)

CRUD tài khoản quản trị, cập nhật trạng thái, tìm kiếm/phân trang.

### Category

| Khu vực | Endpoint             | Quyền  | Mô tả                                    |
| ------- | -------------------- | ------ | ---------------------------------------- |
| Admin   | `/categories`        | Auth   | CRUD danh mục, đổi trạng thái hàng loạt  |
| Client  | `/client/categories` | Public | Lấy danh mục dạng cây/danh sách hiển thị |

### City (`/cities`) — Auth (Admin)

CRUD thành phố/địa điểm để gắn vào tour.

### Tour

| Khu vực | Endpoint        | Quyền  | Mô tả                                                               |
| ------- | --------------- | ------ | ------------------------------------------------------------------- |
| Admin   | `/tours`        | Auth   | CRUD tour, upload ảnh, quản lý lịch trình, đổi trạng thái hàng loạt |
| Client  | `/client/tours` | Public | Danh sách, tìm kiếm, chi tiết tour theo slug                        |

### Cart (`/cart`) — Public

| Method | Endpoint | Mô tả                                                                       |
| ------ | -------- | --------------------------------------------------------------------------- |
| POST   | `/cart`  | Nhận danh sách tour + số lượng từ frontend, tính lại giá & kiểm tra tồn kho |

### Order

| Khu vực | Endpoint         | Quyền  | Mô tả                                         |
| ------- | ---------------- | ------ | --------------------------------------------- |
| Client  | `/client/orders` | Public | Tạo đơn (guest checkout), tra cứu đơn theo mã |
| Admin   | `/orders`        | Auth   | Danh sách, chi tiết, cập nhật trạng thái đơn  |

### Payment (`/payment`) — Public

| Method | Endpoint                    | Mô tả                                          |
| ------ | --------------------------- | ---------------------------------------------- |
| POST   | `/payment/zalopay/create`   | Tạo giao dịch ZaloPay, trả về link thanh toán  |
| POST   | `/payment/zalopay/callback` | Webhook ZaloPay cập nhật trạng thái thanh toán |

## 🔐 Xác Thực & Phân Quyền

```
Đăng nhập (Admin) → Access Token (15 phút) + Refresh Token (7 ngày)
                │
                ▼
  Access Token hết hạn → Gọi /auth/refresh → Access Token mới
```

- **Access Token:** sống ngắn (15 phút), gửi qua header `Authorization: Bearer <token>`
- **Refresh Token:** sống dài (7 ngày)
- **JwtAuthGuard** (`common/guards/jwt-auth.guard.ts`) bảo vệ toàn bộ route quản trị; các route `*-client` không dùng guard này vì phục vụ khách vãng lai
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
│   │   ├── city/                # Thành phố/địa điểm
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
├── docker-compose.yml (đề xuất gộp — xem bên dưới)
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

## 🐳 Gợi ý gộp Docker Compose

Hiện hạ tầng đang tách 2 file compose riêng (`mysql-database/`, `redis-database/`). Có thể gộp thành 1 file trong thư mục gốc dự án để dễ quản lý:

```yaml
services:
  mysql:
    image: mysql:9
    container_name: tourify-db
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
    ports:
      - '3307:3306'
    volumes:
      - db_data:/var/lib/mysql

  phpmyadmin:
    image: phpmyadmin
    container_name: tourify-phpmyadmin
    restart: always
    ports:
      - '8080:80'
    environment:
      - PMA_ARBITRARY=1

  redis:
    image: redis:8
    container_name: tourify-redis
    restart: always
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data

volumes:
  db_data:
  redis_data:
```

## 📄 License

UNLICENSED
