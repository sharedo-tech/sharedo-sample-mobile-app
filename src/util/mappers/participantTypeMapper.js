const irregularPlurals = {
  person: "people"
}

const toOdsEntityType = participantType => {
  if (irregularPlurals[participantType]) {
      return irregularPlurals[participantType];
  }

  return `${participantType}s`;
}

export {
  toOdsEntityType
}