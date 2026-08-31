import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { databaseConfig } from '../configs/database.config';
import { PrismaClient } from '../generated/prisma/client';

const dbUrl = new URL(databaseConfig.url as string);
const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: dbUrl.port ? Number(dbUrl.port) : 3306,
  user: decodeURIComponent(dbUrl.username),
  password: decodeURIComponent(dbUrl.password),
  database: dbUrl.pathname.replace(/^\//, ''),
});
const prisma = new PrismaClient({ adapter });

const PERMISSIONS_SEED = [
  { code: 'USER_LIST', name: 'Xem danh sách user', group: 'USER' },
  { code: 'USER_CREATE', name: 'Tạo user', group: 'USER' },
  { code: 'USER_UPDATE', name: 'Sửa user', group: 'USER' },
  { code: 'USER_DELETE', name: 'Xoá user', group: 'USER' },

  { code: 'TOUR_LIST', name: 'Xem danh sách tour', group: 'TOUR' },
  { code: 'TOUR_CREATE', name: 'Tạo tour', group: 'TOUR' },
  { code: 'TOUR_UPDATE', name: 'Sửa tour', group: 'TOUR' },
  { code: 'TOUR_DELETE', name: 'Xoá tour', group: 'TOUR' },
  { code: 'TOUR_UPDATE_IMAGE', name: 'Đổi ảnh tour', group: 'TOUR' },

  { code: 'CATEGORY_LIST', name: 'Xem danh sách category', group: 'CATEGORY' },
  { code: 'CATEGORY_CREATE', name: 'Tạo category', group: 'CATEGORY' },
  { code: 'CATEGORY_UPDATE', name: 'Sửa category', group: 'CATEGORY' },
  { code: 'CATEGORY_DELETE', name: 'Xoá category', group: 'CATEGORY' },

  { code: 'CITY_LIST', name: 'Xem danh sách tỉnh/thành', group: 'CITY' },

  { code: 'ORDER_LIST', name: 'Xem danh sách đơn hàng', group: 'ORDER' },
  { code: 'ORDER_VIEW_DETAIL', name: 'Xem chi tiết đơn hàng', group: 'ORDER' },
  {
    code: 'ORDER_UPDATE_STATUS',
    name: 'Cập nhật trạng thái đơn hàng',
    group: 'ORDER',
  },
  { code: 'ORDER_DELETE', name: 'Xoá đơn hàng', group: 'ORDER' },

  { code: 'ROLE_LIST', name: 'Xem danh sách role', group: 'ROLE' },
  { code: 'ROLE_CREATE', name: 'Tạo role', group: 'ROLE' },
  { code: 'ROLE_UPDATE', name: 'Sửa role', group: 'ROLE' },
  { code: 'ROLE_DELETE', name: 'Xoá role', group: 'ROLE' },
  { code: 'ROLE_ASSIGN_PERMISSION', name: 'Gán quyền cho role', group: 'ROLE' },
];

const ROLES_SEED = [
  {
    code: 'ADMIN',
    name: 'Quản trị viên',
    description: 'Full quyền hệ thống',
    isSystem: true,
    permissionCodes: '*' as const,
  },
  {
    code: 'TOUR_MANAGER',
    name: 'Quản lý tour',
    description: 'Quản lý tour, category, tỉnh/thành',
    isSystem: false,
    permissionCodes: [
      'TOUR_LIST',
      'TOUR_CREATE',
      'TOUR_UPDATE',
      'TOUR_DELETE',
      'TOUR_UPDATE_IMAGE',
      'CATEGORY_LIST',
      'CATEGORY_CREATE',
      'CATEGORY_UPDATE',
      'CATEGORY_DELETE',
      'CITY_LIST',
    ],
  },
  {
    code: 'ORDER_STAFF',
    name: 'Nhân viên đơn hàng',
    description: 'Xem và xử lý đơn hàng',
    isSystem: false,
    permissionCodes: ['ORDER_LIST', 'ORDER_VIEW_DETAIL', 'ORDER_UPDATE_STATUS'],
  },
  {
    code: 'USER_MANAGER',
    name: 'Quản lý người dùng',
    description: 'Quản lý tài khoản user',
    isSystem: false,
    permissionCodes: ['USER_LIST', 'USER_CREATE', 'USER_UPDATE', 'USER_DELETE'],
  },
];

const CITIES_SEED = [
  'An Giang',
  'Bắc Ninh',
  'Cà Mau',
  'Cao Bằng',
  'Đắk Lắk',
  'Điện Biên',
  'Đồng Nai',
  'Đồng Tháp',
  'Gia Lai',
  'Hà Nội',
  'Hà Tĩnh',
  'Hải Phòng',
  'Hưng Yên',
  'Khánh Hòa',
  'Lai Châu',
  'Lâm Đồng',
  'Lạng Sơn',
  'Lào Cai',
  'Nghệ An',
  'Ninh Bình',
  'Phú Thọ',
  'Quảng Ngãi',
  'Quảng Ninh',
  'Quảng Trị',
  'Sơn La',
  'Tây Ninh',
  'Thái Nguyên',
  'Thanh Hóa',
  'Thành phố Cần Thơ',
  'Thành phố Đà Nẵng',
  'Thành phố Hồ Chí Minh',
  'Tuyên Quang',
  'Vĩnh Long',
  'Huế',
];

async function seedPermissions() {
  for (const p of PERMISSIONS_SEED) {
    await prisma.permission.upsert({
      where: { code: p.code },
      update: {},
      create: { ...p, isSystem: true },
    });
  }
  console.log(`Seeded ${PERMISSIONS_SEED.length} permissions.`);
}

async function seedRoles() {
  const allPermissions = await prisma.permission.findMany();

  for (const r of ROLES_SEED) {
    const role = await prisma.role.upsert({
      where: { code: r.code },
      update: {
        name: r.name,
        description: r.description,
        isSystem: r.isSystem,
      },
      create: {
        code: r.code,
        name: r.name,
        description: r.description,
        isSystem: r.isSystem,
      },
    });

    const permissionsToAssign =
      r.permissionCodes === '*'
        ? allPermissions
        : allPermissions.filter((p) => r.permissionCodes.includes(p.code));

    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.rolePermission.createMany({
      data: permissionsToAssign.map((p) => ({
        roleId: role.id,
        permissionId: p.id,
      })),
    });

    console.log(
      `Seeded role "${r.code}" with ${permissionsToAssign.length} permission(s).`,
    );
  }
}

async function seedCities() {
  for (const name of CITIES_SEED) {
    await prisma.city.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`Seeded ${CITIES_SEED.length} cities.`);
}

async function main() {
  await seedPermissions();
  await seedRoles();
  await seedCities();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
