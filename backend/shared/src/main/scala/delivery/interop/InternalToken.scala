package delivery.interop

import org.http4s.Header
import org.http4s.Request
import org.typelevel.ci.CIStringSyntax

object InternalToken:

  val headerName: String = "X-Internal-Token"

  def value: String = sys.env.getOrElse("SERVICE_INTERNAL_TOKEN", "dev-internal-token")

  def authorize(req: Request[?]): Boolean =
    req.headers.get(ci"X-Internal-Token").map(_.head.value).contains(value)

  def header: Header.Raw = Header.Raw(ci"X-Internal-Token", value)

end InternalToken
