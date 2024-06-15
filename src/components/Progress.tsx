import classNames from 'classnames'

export const Progress = ({
  className,
  progress,
}: {
  className?: string;
  progress?: number;
}) => {
  return (
    <div
      className={classNames(
          'h-2 rounded-full border border-yellow-500 bg-white',
          className,
          {'w-full': !className},
      )}
    >
      <div
        className="h-full w-full origin-top-left scale-0 rounded-full bg-yellow-500"
        style={{transform: `scaleX(${progress})`}}
      />
    </div>
  )
}
