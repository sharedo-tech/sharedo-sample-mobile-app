const append = (qs, name, value) => {
  if (qs.length === 0) {
      qs = qs + "?";
  } else {
      qs = qs + "&";
  }

  return qs + `${name}=${encodeURIComponent(value)}`;
};

const generate = values => {
  let qs = "";

  if (values) {
      const keys = Reflect.ownKeys(values);

      if (keys && keys.length > 0) {
          for (let i = 0; i < keys.length; i++) {
              const name = keys[i];
              const value = values[name];

              if (value !== undefined && value !== null && value !== "") {
                  if (value instanceof Array && value.length > 0) {
                      value.forEach(v => qs = append(qs, name, v));
                  } else {
                      qs = append(qs, name, value);
                  }
              }
          }
      }
  }

  return qs;
};

export default {
  generate
};