import instance from '../../../utils/axios';

// label page
export const getLabelUserPage = param => instance.get('/app-api/linban/label/page', {params: param});

export const listLabelUserPage = param => instance.get('/app-api/linban/label/list', {params: param});


// save label 
export const saveLabelUser = data => instance.post('/app-api/linban/label/create', data);


export const updateLabelUser = data =>
    instance.put('/app-api/linban/label/update', {data});

export const deleteLabelUser = data => instance.delete('/app-api/linban/label/delete?id=' + data.id);

