import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				crimson: ['Crimson Text', 'serif'],
				inter: ['Inter', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Dark mode specific colors
				'background-dark': 'hsl(var(--background-dark))',
				'foreground-dark': 'hsl(var(--foreground-dark))',
				'card-dark': 'hsl(var(--card-dark))',
				'popover-dark': 'hsl(var(--popover-dark))',
				'primary-dark': 'hsl(var(--primary-dark))',
				'primary-foreground-dark': 'hsl(var(--primary-foreground-dark))',
				'primary-glow-dark': 'hsl(var(--primary-glow-dark))',
				'secondary-dark': 'hsl(var(--secondary-dark))',
				'secondary-foreground-dark': 'hsl(var(--secondary-foreground-dark))',
				'muted-dark': 'hsl(var(--muted-dark))',
				'muted-foreground-dark': 'hsl(var(--muted-foreground-dark))',
				'accent-dark': 'hsl(var(--accent-dark))',
				'accent-foreground-dark': 'hsl(var(--accent-foreground-dark))',
				'destructive-dark': 'hsl(var(--destructive-dark))',
				'destructive-foreground-dark': 'hsl(var(--destructive-foreground-dark))',
				'border-dark': 'hsl(var(--border-dark))',
				'input-dark': 'hsl(var(--input-dark))',
				'ring-dark': 'hsl(var(--ring-dark))',
				'sidebar-dark': {
					DEFAULT: 'hsl(var(--sidebar-background-dark))',
					foreground: 'hsl(var(--sidebar-foreground-dark))',
					primary: 'hsl(var(--sidebar-primary-dark))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground-dark))',
					accent: 'hsl(var(--sidebar-accent-dark))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground-dark))',
					border: 'hsl(var(--sidebar-border-dark))',
					ring: 'hsl(var(--sidebar-ring-dark))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
