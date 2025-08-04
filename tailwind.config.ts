import type { Config } from "tailwindcss";

import tailwindcssAnimate from "tailwindcss-animate";

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
			colors: {
				// Nova Paleta de Cores (Foco no Escuro e Profundo)
				background: '#0D0D12', // Fundo Principal
				card: '#1A1A20', // Superfícies/Cards
				foreground: '#E0E0E5', // Texto Principal
				muted: '#888890', // Texto Secundário/Muted
				border: '#33333A', // Bordas/Linhas
				primary: {
					DEFAULT: '#6A0DAD', // Roxo profundo para primário
					foreground: '#E0E0E5', // Texto claro para primário
				},
				secondary: {
					DEFAULT: '#00CED1', // Ciano/Azul turquesa para secundário
					foreground: '#0D0D12', // Texto escuro para secundário
				},
				destructive: {
					DEFAULT: '#FF6B6B', // Vermelho suave para destrutivo
					foreground: '#0D0D12', // Texto escuro para destrutivo
				},
				accent: {
					DEFAULT: '#00CED1', // Usar ciano para acento
					foreground: '#0D0D12', // Texto escuro para acento
				},
				input: '#33333A',
				ring: '#6A0DAD',

				sidebar: {
					DEFAULT: '#1A1A20',
					foreground: '#E0E0E5',
					primary: '#6A0DAD',
					'primary-foreground': '#E0E0E5',
					accent: '#33333A',
					'accent-foreground': '#E0E0E5',
					border: '#33333A',
					ring: '#6A0DAD'
				},
				dashboard: {
					DEFAULT: '#0D0D12',
					card: '#1A1A20',
					border: '#33333A'
				},
				whatsapp: '#25D366',
				whatsappChat: {
					background: '#131C21', // Dark background for chat area
					bubbleSent: '#005C4B', // Darker green for sent bubbles
					bubbleReceived: '#202C33', // Darker grey for received bubbles
					textDark: '#E9EDEF', // Light text for dark bubbles
					textLight: '#B0B3B8', // Slightly darker light text for secondary info
				},
				ifood: '#EA1D2C',
				ai: '#6A0DAD'
			},
			backgroundImage: {
				'gradient-primary': 'linear-gradient(to right, var(--primary), var(--secondary))',
				'gradient-card': 'linear-gradient(145deg, #1A1A20, #0D0D12)',
				'gradient-dark-primary': 'linear-gradient(to right, #6A0DAD, #00CED1)',
			},
			borderRadius: {
				lg: '1rem',
				md: '0.75rem',
				sm: '0.5rem',
				xl: '1.5rem',
				'2xl': '2rem',
				'3xl': '3rem', // Novo: ainda mais arredondado
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-up': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.95)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'pulse-soft': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'slide-up': 'slide-up 0.4s ease-out',
				'scale-in': 'scale-in 0.3s ease-out',
				'pulse-soft': 'pulse-soft 2s ease-in-out infinite'
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;