// Creates the first admin (from env), demo categories, sample listings and
// reviews. Idempotent: safe to re-run.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { slugify, toSearchText } from "../src/lib/text";
import { computeRatingAggregate } from "../src/modules/reviews/aggregate";

const prisma = new PrismaClient();
const BCRYPT_COST = 12;

const CATEGORIES = [
  "Eletricista",
  "Encanador",
  "Pintor",
  "Diarista",
  "Professor Particular",
  "Desenvolvedor",
  "Fotógrafo",
  "Personal Trainer",
];

interface SeedListing {
  title: string;
  category: string;
  city: string;
  description: string;
  contactWhatsapp?: string;
  reviews: Array<{ userIndex: number; rating: number; comment?: string }>;
}

const LISTINGS: SeedListing[] = [
  {
    title: "Carlos Andrade — Instalações Elétricas",
    category: "Eletricista",
    city: "São Paulo, SP",
    description:
      "Eletricista com 15 anos de experiência em instalações residenciais e comerciais.\n\nServiços: troca de fiação, quadros de distribuição, iluminação LED, laudos técnicos. Atendimento de emergência 24h.",
    contactWhatsapp: "+55 11 98888-0001",
    reviews: [
      { userIndex: 0, rating: 5, comment: "Resolveu um problema antigo no quadro de luz em uma tarde. Recomendo!" },
      { userIndex: 1, rating: 4, comment: "Bom serviço, chegou no horário." },
    ],
  },
  {
    title: "Marina Lopes — Aulas de Matemática e Física",
    category: "Professor Particular",
    city: "Belo Horizonte, MG",
    description:
      "Professora licenciada pela UFMG, especialista em preparação para ENEM e vestibulares.\n\nAulas presenciais ou online, material próprio incluso. Primeira aula experimental gratuita.",
    contactWhatsapp: "+55 31 97777-0002",
    reviews: [
      { userIndex: 0, rating: 5, comment: "Minha filha subiu 200 pontos no simulado depois de 2 meses de aula." },
      { userIndex: 1, rating: 5 },
    ],
  },
  {
    title: "Roberto Pinturas Residenciais",
    category: "Pintor",
    city: "Curitiba, PR",
    description:
      "Pintura interna e externa com acabamento profissional. Orçamento sem compromisso, materiais de primeira linha e limpeza completa ao final do serviço.",
    reviews: [{ userIndex: 1, rating: 4, comment: "Trabalho caprichado, só atrasou um dia na entrega." }],
  },
  {
    title: "Ana Paula — Serviços de Diarista",
    category: "Diarista",
    city: "São Paulo, SP",
    description:
      "Limpeza residencial completa, passadoria e organização de armários. Referências comprovadas, atendo região central e zona oeste.",
    contactWhatsapp: "+55 11 96666-0003",
    reviews: [
      { userIndex: 0, rating: 5, comment: "Super caprichosa e de confiança. Já é a diarista fixa aqui de casa." },
    ],
  },
  {
    title: "Felipe Souza — Desenvolvimento Web",
    category: "Desenvolvedor",
    city: "Remoto",
    description:
      "Desenvolvedor full-stack: sites institucionais, lojas virtuais e sistemas sob medida.\n\nStack: React, Next.js, Node.js. Portfólio disponível sob solicitação.",
    reviews: [],
  },
  {
    title: "Estúdio Luz Norte — Fotografia",
    category: "Fotógrafo",
    city: "Florianópolis, SC",
    description:
      "Ensaios de família, casamentos e fotografia de produto. Entrega em galeria digital com tratamento profissional de imagem.",
    reviews: [{ userIndex: 0, rating: 3, comment: "Fotos bonitas, mas a entrega demorou mais que o combinado." }],
  },
];

async function seedAdmin(): Promise<void> {
  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@connect.local").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!password) {
    throw new Error("SEED_ADMIN_PASSWORD não definido no .env");
  }
  // Re-hash on every run so o .env continua sendo a fonte da senha do admin
  // mesmo quando o usuário já existe (ex.: .env editado após o primeiro seed).
  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN", passwordHash },
    create: {
      email,
      displayName: "Administrador",
      passwordHash,
      role: "ADMIN",
    },
  });
  process.stdout.write(`Admin: ${email}\n`);
}

async function seedDemoUsers(): Promise<string[]> {
  const users = [
    { email: "joana@example.com", displayName: "Joana Ribeiro" },
    { email: "pedro@example.com", displayName: "Pedro Martins" },
  ];
  const ids: string[] = [];
  for (const user of users) {
    const created = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        ...user,
        passwordHash: await bcrypt.hash("senha-demo-123", BCRYPT_COST),
        role: "USER",
      },
    });
    ids.push(created.id);
  }
  return ids;
}

async function main(): Promise<void> {
  await seedAdmin();
  const demoUserIds = await seedDemoUsers();

  const categoryIds = new Map<string, string>();
  for (const [index, name] of CATEGORIES.entries()) {
    const category = await prisma.category.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name), sortOrder: index },
    });
    categoryIds.set(name, category.id);
  }

  const admin = await prisma.user.findFirstOrThrow({ where: { role: "ADMIN" } });

  for (const item of LISTINGS) {
    const slug = slugify(item.title);
    const existing = await prisma.listing.findUnique({ where: { slug } });
    if (existing) continue;

    const aggregate = computeRatingAggregate(item.reviews.map((r) => r.rating));
    await prisma.listing.create({
      data: {
        slug,
        title: item.title,
        description: item.description,
        searchText: toSearchText(item.title, item.description, item.city),
        categoryId: categoryIds.get(item.category)!,
        city: item.city,
        contactWhatsapp: item.contactWhatsapp ?? null,
        status: "PUBLISHED",
        createdById: admin.id,
        ratingAvg: aggregate.avg,
        ratingCount: aggregate.count,
        reviews: {
          create: item.reviews.map((review) => ({
            userId: demoUserIds[review.userIndex],
            rating: review.rating,
            comment: review.comment ?? null,
          })),
        },
      },
    });
  }

  process.stdout.write("Seed concluído.\n");
}

main()
  .catch((error) => {
    process.stderr.write(`Seed falhou: ${error}\n`);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
