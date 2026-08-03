import './LevelNavigation.css'

export type LevelNavItem = {
  id: number
  title: string
  completed?: boolean
  locked?: boolean
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
          const classes = [
            'level-navigation__item',
            isActive ? 'level-navigation__item--active' : '',
            level.completed ? 'level-navigation__item--completed' : '',
            level.locked ? 'level-navigation__item--locked' : '',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <li key={level.id}>
              <button
                type="button"
                className={classes}
                aria-current={isActive ? 'step' : undefined}
                disabled={level.locked}
                onClick={() => onSelectLevel(level.id)}
              >
                <span className="level-navigation__index">{level.id}</span>
                <span className="level-navigation__title">{level.title}</span>
                {level.completed ? (
                  <span className="level-navigation__badge">Solved</span>
                ) : null}
                {level.locked ? (
                  <span className="level-navigation__badge">Locked</span>
                ) : null}
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default LevelNavigation
