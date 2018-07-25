﻿using System;

namespace AwesomeCMSCore.Modules.Entities.Entities
{
    public class Tag: BaseEntity
    {
        public string TagData { get; set; }
        public string TagOptions { get; set; }
        public string UserId { get; set; }
        public int? PostId { get; set; }
    }
}
