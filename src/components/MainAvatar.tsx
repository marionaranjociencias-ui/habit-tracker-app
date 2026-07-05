import { getActiveForm, getLevel, getMotivationalMessage } from '../utils/calculations';

type MainAvatarProps = {
  globalPercentage: number;
};

export function MainAvatar({ globalPercentage }: MainAvatarProps) {
  const activeForm = getActiveForm(globalPercentage);
  const level = getLevel(globalPercentage);
  const message = getMotivationalMessage(globalPercentage);

  return (
    <div className="main-avatar">
      <p className="main-avatar__message">{message}</p>
      <p className="main-avatar__level">{level}</p>
      <img src={activeForm.image} alt={activeForm.name} className="main-avatar__image" />
      <p className="main-avatar__form">{activeForm.name}</p>
    </div>
  );
}
