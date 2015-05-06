ActiveAdmin.register Survey do
  permit_params :name, :search_key_name, :version, :public_to_all_users, :description, :definition, :study_ids => [], studies_attributes: [:id, :name]
  menu priority: 7

  index do
    selectable_column
    id_column
    column :name
    column :version
    column :public_to_all_users
    column :description
    column :studies do |q|
      q.studies.all.map {|a| a.name.inspect}.uniq.join(', ').gsub /"/, ''
    end

    actions
  end

  filter :name
  filter :version


  show do
     attributes_table do
      row :id
      row :name
      row :search_key_name
      row :version
      row :description
      row :definition
      row :created_at
      row :updated_at
      bool_row :public_to_all_users

    end
    active_admin_comments
  end

  form do |f|
    f.inputs "Survey Details" do
      f.input :name
      f.input :search_key_name
      f.input :version
      f.input :description
      if !current_admin_user.researcher?
        f.input :public_to_all_users, as: :boolean
      end
      if current_admin_user.researcher?
        f.input :studies, as: :check_boxes, collection: current_admin_user.studies
      end
      f.input :definition, as: :text, validates: true, size: nil
    end
  f.actions
  end
end