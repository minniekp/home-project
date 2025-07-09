const filterDescription = description => {
    const txt = document.createElement('textarea');
    txt.innerHTML = description;
    return txt.textContent.replace(/<\/?[^>]+(>|$)/g, "");
};

export const selectMappedActiveModels = state => {
    return state.modeling.active.map(x => {
        if (!x.orgunitlevel1_desc) x.orgunitlevel1_desc = "Accenture";
        if (!x.geounit_desc) x.geounit_desc = "Global";
        if (x.oculus_description) x.oculus_description = filterDescription(x.oculus_description);
        if (!x.modeling_type) x.modeling_type = 'Y';
        return x;
    });
};

export const selectMappedArchiveModels = state => {
    if (state.modeling.archive) {
        return state.modeling.archive.map(x => {
            if (!x.orgunitlevel1_desc) x.orgunitlevel1_desc = "Accenture";
            if (!x.geounit_desc) x.geounit_desc = "Global";
            if (x.oculus_description) x.oculus_description = filterDescription(x.oculus_description);
            if (!x.modeling_type) x.modeling_type = 'Y';
            return x;
        });
    }
    return [];
};

export const selectMappedSharedOculus = state => {
    if (state.modeling.shared) {
        return state.modeling.shared.map(x => {
            if (!x.orgunitlevel1_desc) x.orgunitlevel1_desc = "Accenture";
            if (!x.geounit_desc) x.geounit_desc = "Global";
            if (x.oculus_description) x.oculus_description = filterDescription(x.oculus_description);
            if (!x.modeling_type) x.modeling_type = 'Y';
            return x;
        });
    }
    return [];
};