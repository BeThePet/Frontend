import FoodDetailContent from '@/components/food/FoodDetailContent'

export default function FoodDetailPage({ params }: { params: { slug: string } }) {
  return <FoodDetailContent params={params} />
}
