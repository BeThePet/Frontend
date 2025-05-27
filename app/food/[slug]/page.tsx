import FoodDetailContent from '@/components/food/FoodDetailContent'

export function generateStaticParams() {
  return [
    { slug: 'royal-canin-mini-adult' },
    { slug: 'hills-science-diet' },
    { slug: 'purina-pro-plan' }
  ]
}

export default function FoodDetailPage({ params }: { params: { slug: string } }) {
  return <FoodDetailContent params={params} />
}
