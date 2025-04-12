import instance from '../../../utils/axios';

// label page
export const getLabelUserPage = param => instance.get('/app-api/linban/label/page', {params: param});

export const listLabelUserPage = param => instance.get('/app-api/linban/label/list', {params: param});


// save label 
export const saveLabelUser = data => instance.post('/app-api/linban/label/create', data);


export const updateLabelUser = (id,data) =>
    instance.put('/app-api/linban/label/update/'+id, {data});

export const deleteLabelUser = id => instance.delete('/app-api/linban/label/delete?id=' + id);

