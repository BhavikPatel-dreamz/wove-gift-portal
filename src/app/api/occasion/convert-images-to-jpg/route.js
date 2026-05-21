import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const UPDATE_BATCH_SIZE = 25;

const occasionImagePools = {
  birthday: [
    'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=1200&q=80&fm=jpg',
  ],
  anniversary: [
    'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1517263904808-5dc91e3e7044?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1200&q=80&fm=jpg',
  ],
  wedding: [
    'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1529636798458-92182e662485?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1525253086316-d0c936c814f8?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?w=1200&q=80&fm=jpg',
  ],
  graduation: [
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1513258496099-48168024aec0?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1496317899792-9d7dbcd928a1?w=1200&q=80&fm=jpg',
  ],
  christmas: [
    'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1487349384428-12b47aca925e?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1451772741724-d20990422508?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=1200&q=80&fm=jpg',
    'https://images.unsplash.com/photo-1516528387618-afa90b13e000?w=1200&q=80&fm=jpg',
  ],
};

const fallbackImagePool = occasionImagePools.birthday;

function normalizeOccasionKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function getPoolKeyFromText(value) {
  const normalizedValue = normalizeOccasionKey(value);
  const poolKeys = Object.keys(occasionImagePools);

  return (
    poolKeys.find((poolKey) => normalizedValue.includes(poolKey)) ||
    poolKeys.find((poolKey) => poolKey.includes(normalizedValue)) ||
    null
  );
}

function buildStableIndex(seed, length) {
  const value = String(seed || '');
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return length > 0 ? hash % length : 0;
}

function getRandomOccasionImage({ primaryText, secondaryText, seed }) {
  const poolKey =
    getPoolKeyFromText(primaryText) ||
    getPoolKeyFromText(secondaryText);
  const pool = occasionImagePools[poolKey] || fallbackImagePool;
  const selectedIndex = buildStableIndex(
    `${seed}-${primaryText || ''}-${secondaryText || ''}`,
    pool.length,
  );

  return pool[selectedIndex];
}

function buildOccasionPreview(records) {
  return records.map((record, index) => ({
    id: record.id,
    label: record.name || record.id,
    oldImage: record.image?.trim() || null,
    newImage: getRandomOccasionImage({
      primaryText: record.name,
      seed: `${record.id}-${index}`,
    }),
  }));
}

function buildCategoryPreview(records, occasionImageOffset) {
  return records.map((record, index) => {
    const occasionName = record.occasion?.name || record.name || 'celebration';
    return {
      id: record.id,
      label: record.name || record.id,
      oldImage: record.image?.trim() || null,
      newImage: getRandomOccasionImage({
        primaryText: record.name,
        secondaryText: occasionName,
        seed: `${record.id}-${occasionImageOffset + index}`,
      }),
    };
  });
}

async function getImageReplacementData() {
  const [occasions, occasionCategories] = await Promise.all([
    prisma.occasion.findMany({
      select: { id: true, name: true, image: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.occasionCategory.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        occasion: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  const occasionUpdates = buildOccasionPreview(occasions);
  const categoryUpdates = buildCategoryPreview(
    occasionCategories,
    occasionUpdates.length,
  );

  return {
    occasionUpdates,
    categoryUpdates,
  };
}

function chunkItems(items, chunkSize) {
  const chunks = [];

  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }

  return chunks;
}

async function applyUpdatesInBatches(items, updateRecord) {
  const batches = chunkItems(items, UPDATE_BATCH_SIZE);
  let updatedCount = 0;

  for (const batch of batches) {
    await Promise.all(batch.map((item) => updateRecord(item)));
    updatedCount += batch.length;
  }

  return updatedCount;
}

async function handleConversion({ dryRun }) {
  const { occasionUpdates, categoryUpdates } = await getImageReplacementData();
  const totalUpdates = occasionUpdates.length + categoryUpdates.length;
  let appliedOccasionUpdates = 0;
  let appliedCategoryUpdates = 0;

  if (!dryRun && totalUpdates > 0) {
    appliedOccasionUpdates = await applyUpdatesInBatches(
      occasionUpdates,
      (item) =>
        prisma.occasion.update({
          where: { id: item.id },
          data: { image: item.newImage },
        }),
    );

    appliedCategoryUpdates = await applyUpdatesInBatches(
      categoryUpdates,
      (item) =>
        prisma.occasionCategory.update({
          where: { id: item.id },
          data: { image: item.newImage },
        }),
    );
  }

  return NextResponse.json({
    success: true,
    dryRun,
    message: dryRun
      ? 'Dry run complete. No database rows were updated.'
      : totalUpdates > 0
        ? 'Occasion and occasion category images were updated to sample photo URLs.'
        : 'No occasion or occasion category records were found.',
    summary: {
      occasionsToUpdate: occasionUpdates.length,
      occasionCategoriesToUpdate: categoryUpdates.length,
      totalUpdates,
      appliedOccasionUpdates,
      appliedOccasionCategoryUpdates: appliedCategoryUpdates,
    },
    samples: {
      occasions: occasionUpdates.slice(0, 10),
      occasionCategories: categoryUpdates.slice(0, 10),
    },
  });
}

export async function GET() {
  try {
    return await handleConversion({ dryRun: true });
  } catch (error) {
    console.error('GET /api/occasion/convert-images-to-jpg failed:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to preview sample image replacement.',
      },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    let body = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const dryRun = body?.dryRun === true;
    return await handleConversion({ dryRun });
  } catch (error) {
    console.error('POST /api/occasion/convert-images-to-jpg failed:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to replace occasion images with sample URLs.',
      },
      { status: 500 },
    );
  }
}
