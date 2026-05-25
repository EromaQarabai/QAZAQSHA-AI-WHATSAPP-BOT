// Соңғы белсенді сөйлесушіні бақылау
let соңғыЖид = null;
let соңғыУақыт = 0;

export function setLastActiveJid(жид) {
  соңғыЖид = жид;
  соңғыУақыт = Date.now();
}

export function getLastActiveJid() {
  // 30 минут ішінде белсенді болса ғана
  if (Date.now() - соңғыУақыт < 30 * 60 * 1000) {
    return соңғыЖид;
  }
  return null;
}
