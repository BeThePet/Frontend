import Image from "next/image"
import Link from "next/link"

interface AppLogoProps {
  size?: "sm" | "md" | "lg"
  withText?: boolean
  className?: string
}

export default function AppLogo({ size = "md", withText = true, className = "" }: AppLogoProps) {
  const sizes = {
    sm: { logo: 40, text: "text-lg" },
    md: { logo: 60, text: "text-xl" },
    lg: { logo: 100, text: "text-3xl" },
  }

  return (
    <Link href="/dashboard" className={`flex items-center ${className}`}>
      <div className="relative">
        <Image
          src="/logo.png"
          alt="DogCareMate 로고"
          width={sizes[size].logo}
          height={sizes[size].logo}
          className="animate-float"
        />
      </div>
      {withText && (
        <div className="ml-2">
          <span className={`font-bold text-gray-800 ${sizes[size].text}`}>DogCareMate</span>
          {size !== "sm" && <p className="text-xs text-gray-500">반려견 건강 파트너</p>}
        </div>
      )}
    </Link>
  )
}
