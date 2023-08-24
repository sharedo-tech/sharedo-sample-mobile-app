import moment from 'moment';

/* Define POI handlers that we want to display, and control how they are mapped.
 * - type: handler system name
 * - title: "new title"
 * - showNotes: true/false (default true)
 * - titleAsNotes: true/false (default false)
 */
const supportedHandlers = [
  { type: "comment", showNotes: false },
  { type: "docgen", title: "Document generated", titleAsNotes: true },
  { type: "document-deleted", title: "Document deleted", titleAsNotes: true },
  { type: "document-filing", title: "Document filed", titleAsNotes: true },
  { type: "document-upload", title: "Document uploaded", titleAsNotes: true },
  { type: "emails", title: "Email sent", titleAsNotes: true },
  { type: "milestone", showNotes: false },
  { type: "task-milestone", showNotes: false },
];

const toChronologyListItems = items => items
  .filter(item => {
    return !!supportedHandlers.find(x => x.type === item.poiSystemName) && !item.isPrivate;
  })
  .map(item => {
    var handler = supportedHandlers.find(x => x.type === item.poiSystemName);

    if (handler.showNotes === false) {
      item.notes = null;
    }

    if (handler.titleAsNotes === true) {
      item.notes = item.title;
    }

    if (handler.title) {
      item.title = handler.title;
    }

    return {
      id: item.id,
      title: item.title,
      notes: item.notes,
      poiTypeColour: item.poiTypeColour,
      userFullName: item.userFullName,
      poiTypeIcon: item.poiTypeIcon,
      created: item.created
    };
  });

export {
  toChronologyListItems
}