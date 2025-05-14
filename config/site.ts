export type NavItem = {
  title: string
  href: string
  disabled?: boolean
}

export type MainNavItem = NavItem

export type SiteConfig = {
  name: string
  description: string
  mainNav: MainNavItem[]
  links: {
    github: string
    twitter: string
    facebook: string
    instagram: string
  }
}

export const siteConfig: SiteConfig = {
  name: "FarmCredit",
  description: "Connecting Nigerian farmers with lenders for sustainable growth",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "About Us",
      href: "/about-us",
    },
    {
      title: "Education Hub",
      href: "/education-hub",
    },
    {
      title: "Team",
      href: "/team",
    },
    {
      title: "Careers",
      href: "/careers",
    },
    {
      title: "Financial Tips",
      href: "/financial-tips",
    },
    {
      title: "Help Center",
      href: "/help-center",
    },
  ],
  links: {
    github: "https://github.com/farmcredit",
    twitter: "https://twitter.com/farmcredit",
    facebook: "https://facebook.com/farmcredit",
    instagram: "https://instagram.com/farmcredit",
  },
}
