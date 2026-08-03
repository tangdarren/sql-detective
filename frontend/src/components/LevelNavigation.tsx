import './LevelNavigation.css'

export type LevelNavItem = {
  id: number
  title: string
}

type LevelNavigationProps = {
  levels: LevelNavItem[]
  activeLevelId: number
  onSelectLevel: (levelId: number) => void
}

function LevelNavigation({ levels, activeLevelId, onSelectLevel }: LevelNavigationProps) {
  return (
    <nav className="level-navigation" aria-label="Investigation levels">
      <h2 className="level-navigation__heading">Levels</h2>
      <ol className="level-navigation__list">
        {levels.map((level) => {
          const isActive = level.id === activeLevelId

          return (
            <li key={level.id}>
              <button
                type="button"
                className={
                  isActive
                    ? 'level-navigation__item level-navigation__item--active'
                    : 'level-navigation__item'
                }
                aria-current={isActive ? 'step' : undefined}
                onClick={() => onSelectLevel(level.id)}
              >
                <span className="level-navigation__index">{level.id}</span>
                <span className="level-navigation__title">{level.title}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default LevelNavigation
