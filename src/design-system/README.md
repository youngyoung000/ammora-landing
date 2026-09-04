# Ammora Design System

랜딩과 이후 추가되는 페이지/탭이 같은 시각 언어를 사용하기 위한 단일 기준이다.

## Structure

- `tokens.css`: 브랜드 컬러, 라이트/다크 시맨틱 컬러, 타입 스케일, 간격, 라운드, 컨테이너, 모션
- `primitives.css`: 컨테이너, 섹션 헤더, 버튼, pill, 패널, divider grid, tabs, focus state
- `index.jsx`: 위 프리미티브를 사용하는 React 컴포넌트와 테마 상태 훅

## Rules

1. 새 페이지의 최상단은 반드시 `ThemeRoot`로 감싼다.
2. 색상은 hex 값을 직접 쓰지 않고 `--ds-color-*` 또는 `--ds-brand-*` 토큰을 사용한다.
3. 주요 콘텐츠 폭은 `Container`, 세로 구간은 `Section`을 사용한다.
4. CTA는 primary/secondary 두 단계만 사용하며 primary는 항상 black/white다.
5. 정보 그룹은 큰 카드 그림자보다 1px divider 구조를 우선한다.
6. pill과 숫자 badge는 fill 없이 stroke를 기본으로 한다.
7. 모바일 분기는 1000px, 640px 기준을 유지한다.

## New page example

```jsx
import {
  Button,
  Container,
  DividerGrid,
  Pill,
  Section,
  SectionHeader,
  Tabs,
  ThemeRoot,
  useAmmoraTheme,
} from './design-system/index.jsx'

export default function MarketsPage() {
  const { theme, toggleTheme } = useAmmoraTheme()

  return (
    <ThemeRoot theme={theme}>
      <Container>
        <Tabs
          activeKey="markets"
          items={[
            { key: 'overview', label: 'Overview', href: '/' },
            { key: 'markets', label: 'Markets', href: '/markets' },
          ]}
        />
      </Container>

      <Section>
        <Container>
          <SectionHeader
            title="Markets"
            description="Explore active markets and liquidity models."
          />
          <DividerGrid columns={2}>
            <article><Pill>ALMM</Pill></article>
            <article><Pill>ARL</Pill></article>
          </DividerGrid>
          <Button href="mailto:beta@ammora.xyz">Join Waitlist</Button>
          <button type="button" onClick={toggleTheme}>Toggle theme</button>
        </Container>
      </Section>
    </ThemeRoot>
  )
}
```

## Token naming

- Primitive brand: `--ds-brand-violet`, `--ds-brand-cyan`
- Semantic color: `--ds-color-bg`, `--ds-color-text`, `--ds-color-border`
- Typography: `--ds-text-section`, `--ds-leading-body`
- Spacing: `--ds-space-1` through `--ds-space-32`, `--ds-section-space`
- Shape/control: `--ds-radius-*`, `--ds-control-*`
- Motion: `--ds-duration-*`, `--ds-ease-standard`

현재 랜딩의 기존 변수명은 호환 alias로만 유지한다. 새 코드에서는 반드시 `--ds-*` 토큰을 직접 사용한다.
