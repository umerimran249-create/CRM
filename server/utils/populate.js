// Helper function to populate references
async function populateReferences(items, field, Model, selectFields = null) {
  if (!items || items.length === 0) return items;
  
  const ids = items.map(item => {
    const fieldValue = typeof item[field] === 'string' ? item[field] : item[field];
    return fieldValue;
  }).filter(Boolean);
  
  if (ids.length === 0) return items;
  
  // Get all references and filter by IDs
  const allReferences = await Model.find({});
  const references = allReferences.filter(ref => ids.includes(ref._id));
  const refMap = {};
  references.forEach(ref => {
    refMap[ref._id] = ref;
  });
  
  return items.map(item => {
    const refId = typeof item[field] === 'string' ? item[field] : item[field];
    if (refMap[refId]) {
      const ref = refMap[refId];
      if (selectFields) {
        const selected = {};
        selectFields.forEach(f => {
          if (ref[f] !== undefined) selected[f] = ref[f];
        });
        selected._id = ref._id;
        item[field] = selected;
      } else {
        item[field] = ref;
      }
    }
    return item;
  });
}

// Helper to populate array references
async function populateArrayReferences(items, field, Model, selectFields = null) {
  if (!items || items.length === 0) return items;
  
  const allIds = [];
  items.forEach(item => {
    let fieldValue = item[field];
    if (typeof fieldValue === 'string') {
      try {
        fieldValue = JSON.parse(fieldValue);
      } catch (e) {
        fieldValue = [];
      }
    }
    
    if (Array.isArray(fieldValue)) {
      fieldValue.forEach(id => {
        if (id && !allIds.includes(id)) allIds.push(id);
      });
    }
  });
  
  if (allIds.length === 0) return items;
  
  // Get all references and filter by IDs
  const allReferences = await Model.find({});
  const references = allReferences.filter(ref => allIds.includes(ref._id));
  const refMap = {};
  references.forEach(ref => {
    refMap[ref._id] = ref;
  });
  
  return items.map(item => {
    let fieldValue = item[field];
    if (typeof fieldValue === 'string') {
      try {
        fieldValue = JSON.parse(fieldValue);
      } catch (e) {
        fieldValue = [];
      }
    }
    
    if (Array.isArray(fieldValue)) {
      item[field] = fieldValue.map(id => {
        if (refMap[id]) {
          const ref = refMap[id];
          if (selectFields) {
            const selected = {};
            selectFields.forEach(f => {
              if (ref[f] !== undefined) selected[f] = ref[f];
            });
            selected._id = ref._id;
            return selected;
          }
          return ref;
        }
        return id;
      });
    }
    return item;
  });
}

module.exports = { populateReferences, populateArrayReferences };


