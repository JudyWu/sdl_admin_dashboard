class Admin::ImagesController < ApplicationController
  def show
    image = Mongoid::GridFs.get(params[:id])
    filename = image.filename
    # save_path = '~/admindashboard/current/data'
    file_path = File.join(Rails.root.to_s + '/data/' + filename)

    # temp = Tempfile.new(params[:id])
    data = File.read(file_path)
    # spawn 'rm -Rf ' + @filename

    send_file file_path, type: image.content_type, disposition: 'attachment'
    # begin
    #   File.open(params[:id], 'wb') do |f|
    #     f.write(data)
    #   end
    #   send_file file_path, type: image.content_type, disposition: 'attachment'
    # ensure
    #   temp.close
    #   temp.unlink
    # end
  end
end