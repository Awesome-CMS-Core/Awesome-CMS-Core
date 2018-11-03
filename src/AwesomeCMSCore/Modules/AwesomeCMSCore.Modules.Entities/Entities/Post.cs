using System.Collections.Generic;
using AwesomeCMSCore.Modules.Entities.Enums;

namespace AwesomeCMSCore.Modules.Entities.Entities
{
    public class Post: BaseEntity
    {
        public string Title { get; set; }
        public string ShortDescription { get; set; }
        public string Content { get; set; }
        public string Tags { get; set; }
        public string Categories { get; set; }
        public PostStatus PostStatus { get; set; }
		public int Views { get; set; }
        public virtual User User { get; set; }
        public virtual ICollection<Comment> Comments { get; set; }
        public virtual ICollection<Media> Medias { get; set; }
    }
}
