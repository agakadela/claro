export default async function SubcategoryPage({
  params,
}: {
  params: Promise<{ category: string; subcategory: string }>;
}) {
  const { category, subcategory } = await params;
  return (
    <div>
      {category} - {subcategory}
    </div>
  );
}
