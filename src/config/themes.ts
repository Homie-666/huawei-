/**
 * 主题色板定义
 * 每套主题只描述「颜色变量」，通过 cssVariables.applyTheme 注入到 :root
 * 尺寸 / 圆角 / 字体 / 过渡等与主题无关的变量统一写在 styles/variables.css
 */

export interface ThemeDefinition {
  id: string
  name: string
  icon: string
  dark: boolean
  variables: Record<string, string>
}

export const themes: ThemeDefinition[] = [
  {
    id: 'light',
    name: '晴日',
    icon: '☀️',
    dark: false,
    variables: {
      '--c-bg': '#f4f6fb',
      '--c-bg-soft': '#eaeff8',
      '--c-surface': '#ffffff',
      '--c-surface-2': '#f7f9fd',
      '--c-border': '#e4e9f2',
      '--c-border-strong': '#d3dbea',
      '--c-text': '#18202f',
      '--c-text-soft': '#4c586b',
      '--c-text-muted': '#8b97a9',
      '--c-primary': '#4d7cfe',
      '--c-primary-hover': '#3a68ec',
      '--c-primary-soft': 'rgba(77, 124, 254, 0.12)',
      '--c-on-primary': '#ffffff',
      '--c-accent': '#7c5cff',
      '--c-success': '#12b76a',
      '--c-danger': '#f04438',
      '--c-warning': '#f79009',
      '--c-col-todo': '#4d7cfe',
      '--c-col-doing': '#f79009',
      '--c-col-done': '#12b76a',
      '--c-glow-1': 'rgba(77, 124, 254, 0.16)',
      '--c-glow-2': 'rgba(124, 92, 255, 0.14)',
      '--shadow-card': '0 2px 10px rgba(21, 38, 74, 0.06)',
      '--shadow-hover': '0 12px 26px rgba(21, 38, 74, 0.13)',
      '--shadow-pop': '0 24px 60px rgba(21, 38, 74, 0.18)',
      '--c-column-bg': 'rgba(255, 255, 255, 0.55)'
    }
  },
  {
    id: 'dark',
    name: '深夜',
    icon: '🌙',
    dark: true,
    variables: {
      '--c-bg': '#0f141d',
      '--c-bg-soft': '#151c27',
      '--c-surface': '#1a222f',
      '--c-surface-2': '#202a39',
      '--c-border': '#2a3547',
      '--c-border-strong': '#3a475c',
      '--c-text': '#e9eef8',
      '--c-text-soft': '#b3bfd2',
      '--c-text-muted': '#7d8a9e',
      '--c-primary': '#6690ff',
      '--c-primary-hover': '#7fa2ff',
      '--c-primary-soft': 'rgba(102, 144, 255, 0.18)',
      '--c-on-primary': '#0b1018',
      '--c-accent': '#a78bfa',
      '--c-success': '#34d399',
      '--c-danger': '#fb7185',
      '--c-warning': '#fbbf24',
      '--c-col-todo': '#6690ff',
      '--c-col-doing': '#fbbf24',
      '--c-col-done': '#34d399',
      '--c-glow-1': 'rgba(102, 144, 255, 0.18)',
      '--c-glow-2': 'rgba(167, 139, 250, 0.14)',
      '--shadow-card': '0 2px 12px rgba(0, 0, 0, 0.4)',
      '--shadow-hover': '0 14px 30px rgba(0, 0, 0, 0.55)',
      '--shadow-pop': '0 28px 70px rgba(0, 0, 0, 0.6)',
      '--c-column-bg': 'rgba(26, 34, 47, 0.6)'
    }
  },
  {
    id: 'candy',
    name: '多彩',
    icon: '🎨',
    dark: false,
    variables: {
      '--c-bg': '#fff5f9',
      '--c-bg-soft': '#ffeaf3',
      '--c-surface': '#ffffff',
      '--c-surface-2': '#fff7fb',
      '--c-border': '#f6dfeb',
      '--c-border-strong': '#eec9dd',
      '--c-text': '#2b1a2a',
      '--c-text-soft': '#6b5069',
      '--c-text-muted': '#a389a0',
      '--c-primary': '#ff5d8f',
      '--c-primary-hover': '#f0477c',
      '--c-primary-soft': 'rgba(255, 93, 143, 0.14)',
      '--c-on-primary': '#ffffff',
      '--c-accent': '#7c5cff',
      '--c-success': '#0fbf8f',
      '--c-danger': '#f4436c',
      '--c-warning': '#f59e0b',
      '--c-col-todo': '#7c5cff',
      '--c-col-doing': '#f59e0b',
      '--c-col-done': '#0fbf8f',
      '--c-glow-1': 'rgba(255, 93, 143, 0.2)',
      '--c-glow-2': 'rgba(124, 92, 255, 0.18)',
      '--shadow-card': '0 2px 12px rgba(180, 60, 120, 0.08)',
      '--shadow-hover': '0 14px 28px rgba(180, 60, 120, 0.16)',
      '--shadow-pop': '0 26px 64px rgba(180, 60, 120, 0.22)',
      '--c-column-bg': 'rgba(255, 255, 255, 0.6)'
    }
  }
]

export const defaultThemeId = 'light'

export function findTheme(id: string): ThemeDefinition {
  return themes.find((theme) => theme.id === id) || themes[0]
}
